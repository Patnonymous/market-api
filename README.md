# market-api
Small marketplaces API.

Run as dev:
npm start
Run as dev with nodemon:
nodemon .\bin\www


API Responses:

Success Response (no data to return): Send 200.
Example: res.sendstatus(200);
Client recieves this as: 200 (OK)

Error Response: Send the appropriate error code, along with an error message within an object.
Example: res.status(409).send({error: 'This username already exists.'})
