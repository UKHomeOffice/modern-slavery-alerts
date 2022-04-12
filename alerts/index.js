'use strict';

const Logger = require('node-json-logger');
const logger = new Logger();
const config = require('../config');
const knexfile = require(`${config.migrationsRepo}`);
const knexfileConfig = knexfile[process.env.NODE_ENV ? 'production' : 'development'];
const tableName = config.tableName;
const knex = require('knex')(knexfileConfig);
const moment = require('moment');

const selectableProps = [
  'id',
  'session',
  'created_at',
  'updated_at'
];

const notifyKey = process.env.NOTIFY_KEY;
const NotifyClient = require('notifications-node-client').NotifyClient;
const notifyClient = new NotifyClient(notifyKey);

const TIMEOUT_TEMPLATE = process.env.TIMEOUT_TEMPLATE;
const SAVE_REPORT_TEMPLATE = process.env.SAVE_REPORT_TEMPLATE;
const SOON_TO_BE_DELETED_TEMPLATE = process.env.SOON_TO_BE_DELETED_TEMPLATE;
const DELETE_TEMPLATE = process.env.DELETE_TEMPLATE;
const URL = process.env.APP_URL;

// session timeout in seconds, alert and delete in days
const NRM_FORM_SESSION_TIMEOUT = process.env.SESSION_TTL || 3600;
const FIRST_ALERT_TIMEOUT = process.env.FIRST_ALERT_TIMEOUT || 21;
const DELETION_TIMEOUT = process.env.DELETION_TIMEOUT || 28;

const sendNotifyEmail = (template, email, content) => {
  return notifyClient.sendEmail(template, email, {
    personalisation: content 
  })
}

setInterval(() => {
  knex.select(selectableProps)
    .from(tableName)
    .then(reports => {
      const promises = [];

      reports.forEach(report => {
        const email = report.session['user-email'];
        const updated = moment(report.updated_at).startOf('day');
        const personalisation = {
          reference: report.session.reference,
          deadline: moment(report.updated_at).add(DELETION_TIMEOUT, 'days').format('DD MMMM YYYY'),
          url: URL
        }

      // alert about newly saved case
        if (report.session.alertUser === true) {
          logger.info('New save and return', {id: report.id});

          promises.push(sendNotifyEmail(SAVE_REPORT_TEMPLATE, email, personalisation))
        } else if (!report.session.hasOwnProperty('alertUser') &&
        moment().diff(report.updated_at, 'seconds') > NRM_FORM_SESSION_TIMEOUT) {
        // check for expired sessions (they wont have an alertUser key but will be over an hour old)
          logger.info('Session expired for user', {id: report.id});

          promises.push(sendNotifyEmail(TIMEOUT_TEMPLATE, email, personalisation))
        } else if (moment().diff(updated, 'days') > DELETION_TIMEOUT) {
        // report is deleted
          logger.info('Deleted old report', {id: report.id});

          promises.push(sendNotifyEmail(DELETE_TEMPLATE, email, personalisation))
          promises.push(knex(tableName).where({id: report.id}).del());
          return;
        } else if (!report.session.hasOwnProperty('firstAlert') &&
        moment().diff(updated, 'days') >= FIRST_ALERT_TIMEOUT) {
        // report is coming up for deletion
          logger.info(`${FIRST_ALERT_TIMEOUT} day warning for report`, {id: report.id});

          promises.push(sendNotifyEmail(SOON_TO_BE_DELETED_TEMPLATE, email, personalisation))
          report.session.firstAlert = true;
        } else {
          return;
        }

        report.session.alertUser = false;

        promises.push(knex(tableName).where({
          id: report.id
        })
          .update({session: report.session}));
      });

      return Promise.all(promises);
    });
}, 12000);