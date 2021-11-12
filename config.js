'use strict';

module.exports = {
  migrationsRepo: process.env.MIGRATIONS_REPO || 'ms-schema',
  tableName: process.env.TABLE_NAME || 'reports',
  serviceType: process.env.SERVICE_TYPE || 'modern-slavery'
};
