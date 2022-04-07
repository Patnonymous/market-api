# market-api
Small marketplaces API.

## Starting the server
Run as dev:
npm start

Run as dev with nodemon:
nodemon .\bin\www


#### API Responses
Success Response (no data to return): Send 200.
Description: Successful responses which are sending no data.
Example: res.sendstatus(200);
Client receives this as: 200 (OK).

Caught Error Response: Send the appropriate error code, along with a user friendly error message.
Description: A known error has been caught and handled, this should send back an error message.
Example: res.status(409).send({errorMessage: 'This username already exists.'}).
Client receives this as: 409 Conflict error, errorMessage is accessible in 'error.response.data'.

Uncaught Error Response: Allow Express error handling middleware to send response.
Description: An uncaught unknown error which will probably require an admin to check it out.
Example: next(error).
Client receives this as: Appropriate error code, for example 404 Not Found.