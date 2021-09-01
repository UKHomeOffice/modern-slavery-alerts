# Modern Slavery Data Service
Provides a service layer to talk to a database to store and manage data for the
[modern slavery](https://github.com/UKHomeOffice/modern-slavery) application

The main modern slavery service has the ability to save an application or read a saved application. In order to do this, it needs to use this modern-slavery-data-service.

**Saving:** The main application will send the data to this service as an end point.  This service will connect to a database and store that data and respond back to the main application if successful

**Reading:** The main application will make a request to this modern-slavery-data-service.  This service will then connect to the database, get the data back and send it to the main application if it is successful

## Install & Run <a name="install-and-run"></a>
The application can be run on your local machine

### Dependencies <a name="dependencies"></a>
You will need to have the following installed:

[Node JS](https://nodejs.org/en/download/releases/) ( LTS Erbium v12.x )

[npm](https://www.npmjs.com/get-npm) ( v6.x )

[PostgreSQL](https://www.postgresql.org/download/) ( v12.x )

### PostgreSQL setup <a name="postgresql-setup"></a>
To run this app locally you will need to set up a new role and database.

To create the user - access your postgresql terminal and enter:
```
CREATE ROLE knex with LOGIN;
```
For the database:
```
CREATE DATABASE knex_session;
```

You can then run ```npm run migrate``` to finish the configuration.

## Running the application

Ensure your database service is available and running.

Then to run the service use:

 ```npm start``` to run the server.

```npm run alerts``` to run the alerts app.

```npm run lookup``` to run the lookup app.

With the server running you can run the main app with save and return functionality. 
See details of how to do this in [modern slavery](https://github.com/UKHomeOffice/modern-slavery) application

