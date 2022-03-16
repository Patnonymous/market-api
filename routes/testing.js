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
        stmt.run(['Testing First Name', 'Testing Last Name']);
        stmt.finalize();
    });


    // Close
    db.close();
    res.send("Pong. Try running /dbtestselect.");
});

/**
 * GET /dbtestselect. Selects the rows inserted by /dbtestinsert and returns them.
 * https://stackoverflow.com/questions/56602443/async-await-still-running-asynchronously
 */
router.get('/dbtestselect', async function (req, res, next) {
    const TAG = '\n/dbtestselect(), ';
    console.log(TAG + 'Doing test select.');
    let db = dbConfig.openDatabase();

    db.serialize(function () {
        let arraySelectData = [];
        db.each('SELECT rowid as id, first_name, last_name FROM testing', function (err, row) { // Function for each row.
            console.log(`ID: ${row.id}, row data: ${row.first_name} ${row.last_name}`);
            let rowDataAsString = `${row.id}: ${row.first_name} ${row.last_name}`;
            arraySelectData.push(rowDataAsString);
        }, (err, rowCount) => { // Function when fully completed (all rows found).
            console.log('Reached complete statement. rowCount: ', rowCount);
            console.log('arraySelectData: ');
            console.log(arraySelectData);
        })
    });


    // function selectRowsEach() {
    //     return new Promise((resolve, reject) => {
    //         // Select rows and add to the array.
    //         db.serialize(function () {
    //             let arraySelectData = []
    //             db.each('SELECT rowid as id, first_name, last_name FROM testing', function (err, row) {
    //                 // Reject if error.
    //                 if (err) {
    //                     reject(err);
    //                 };
    //                 console.log(`ID: ${row.id}, row data: ${row.first_name} ${row.last_name}`);
    //                 let rowDataAsString = `${row.id}: ${row.first_name} ${row.last_name}`;
    //                 arraySelectData.push(rowDataAsString);
    //             });
    //         });
    //     })
    // }


    // Close.
    db.close();
    res.send("Hello.");

});


module.exports = router;