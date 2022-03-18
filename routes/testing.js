var express = require('express');
var router = express.Router();
var dbConfig = require('../configs/dbconfig');

/**
 * GET testing /ping route. Pongs if everything is working right.
 */
router.get('/ping', function (req, res, next) {
    res.send('Pong. Received!');
});

/**
 * GET /dbping route. Creates testing table if it does not exist.
 */
router.get('/dbping', function (req, res, next) {
    const TAG = '/dbping(), ';
    console.log(TAG + 'Creating testing table.')
    let db = dbConfig.openDatabase();

    db.serialize(function () {
        // Create table.
        db.run('CREATE TABLE IF NOT EXISTS testing (first_name TEXT NOT NULL, last_name TEXT NOT NULL)');
    });

    // Close.
    db.close();
    res.send('Pong. DB with table should exist now.');

});

/**
 * GET /dbtestinsert. Attempts to insert a hardcoded row for testing purposes.
 */
router.get('/dbtestinsert', function (req, res, next) {
    let db = dbConfig.openDatabase();

    db.serialize(function () {
        // Insert rows with hardcoded data.
        // Fields are not unique so this should be fine to run more than once.
        let stmt = db.prepare('INSERT INTO testing VALUES (?, ?)');
        stmt.run(['Testing First Name', 'Testing Last Name'], function (err) {
            if (err) {
                console.log(TAG + 'Error: ');
                console.log(err);
                next(err);
            } else {
                res.send('Test row INSERT success. Try doing /dbtestselect.');
            }
        });
        stmt.finalize();
    });


    // Close
    db.close();
});

/**
 * GET /dbtestselect. Selects the rows inserted by /dbtestinsert and returns them.
 * https://stackoverflow.com/questions/56602443/async-await-still-running-asynchronously
 */
router.get('/dbtestselect', function (req, res, next) {
    const TAG = '\n/dbtestselect(), ';
    console.log(TAG + 'Doing a simple test select.');
    let db = dbConfig.openDatabase();

    db.serialize(function () {
        let arraySelectData = [];
        db.each('SELECT rowid as id, first_name, last_name FROM testing', function (err, row) { // Function for each row.
            if (err) {
                console.log(TAG + 'Error: ');
                console.log(err);
                next(err);
            } else {
                console.log(`ID: ${row.id}, row data: ${row.first_name} ${row.last_name}`);
                arraySelectData.push({ id: row.id, first_name: row.first_name, last_name: row.last_name });
            }
        }, (err, rowCount) => { // Function when completed.
            if (err) {
                console.log(TAG + 'Error: ');
                console.log(err);
                next(err);
            } else {
                res.send(arraySelectData);
            }
        })
    });

    db.close();
});

/**
 * GET /dbtesterrorv1. Purposely causes an error before the seralize statement.
 * Express middleware should catch and response with a 500 code.
 */
router.get('/dbtesterrorv1', function (req, res, next) {
    const TAG = '\n/dbtesterrorv1(), ';
    console.log(TAG + "Is going to cause an error outside the seralize.");

    // Behold.
    fooBarVar = foobarvar.length + 1;


    let db = dbConfig.openDatabase();

    db.serialize(function () {
        let arraySelectData = [];
        db.each('SELECT rowid as id, first_name, last_name FROM testing', function (err, row) { // Function for each row.
            console.log(`ID: ${row.id}, row data: ${row.first_name} ${row.last_name}`);
            arraySelectData.push({ id: row.id, first_name: row.first_name, last_name: row.last_name });
        }, (err, rowCount) => { // Function when fully completed (all rows found).
            console.log('\nReached complete statement. rowCount: ', rowCount);
            console.log('arraySelectData: ');
            console.log(arraySelectData);

            res.send(arraySelectData);
        })
    });

    db.close();
});

/**
 * GET /dbtesterrorv2. Causes an error inside the seralize block.
 * Attempts to SELECT from a  table which does not exist.
 * sqlite handles this in the completion block, not the function called for db.each.
 */
router.get('/dbtesterrorv2', function (req, res, next) {
    const TAG = '\n/dbtesterrorv2(), ';
    let db = dbConfig.openDatabase();

    db.serialize(function () {
        let arraySelectData = [];
        // Attempt to use a bad statement.
        // Assuming foobartesting does not exist.
        db.each('SELECT rowid as id, first_name, last_name FROM foobartesting', function (err, row) { // Function for each row.
            console.log(`ID: ${row.id}, row data: ${row.first_name} ${row.last_name}`);
            arraySelectData.push({ id: row.id, first_name: row.first_name, last_name: row.last_name });
        }, (err, rowCount) => { // Function when completed.
            console.log('\nReached complete statement. rowCount: ', rowCount);
            if (err) {
                console.log(TAG + 'Error: ');
                console.log(err);
                next(err);
            } else {
                res.send(arraySelectData);
            }
        })
    });

    db.close();
});

/**
 * GET /dbtesterrorinsert. Causes an error when trying an INSERT statement.
 */
router.get('/dbtesterrorinsert', function (req, res, next) {
    const TAG = '\n/dbtesterrorinsert(), ';
    console.log(TAG + 'Running.');

    let db = dbConfig.openDatabase();

    db.serialize(function () {
        let stmt = db.prepare('INSERT INTO testing VALUES (?, ?)');
        // Provide too many binding vars to see what happens.
        stmt.run(['Testing First Name', 'Testing Last Name', 'Foo bar bazzle'], function (err) {
            console.log('stmt run callback.');
            if (err) {
                console.log(TAG + 'Error: ');
                console.log(err);
                next(err);
            } else {
                res.send('Test row INSERT success. Try doing /dbtestselect.');
            }
        });
        stmt.finalize();
    });


    // Close
    db.close();
});



module.exports = router;