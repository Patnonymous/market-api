var sqlite3 = require('sqlite3').verbose();
// Database file name var. Helps prevent typos.
var dbFileName = './configs/marketdb.db';

/**
 * @description Opens and returns a sqlite3 databse object.
 * @returns {Database} sqlite3 database.
 */
function openDatabase() {
    return new sqlite3.Database(dbFileName);
};

/**
 * @description Initializes the database tables if they are NOT EXISTS.
 * Since this uses sqlite3 this should be called when the api starts up.
 */
function initializeDatabase() {
    const TAG = 'dbconfig initializeDatabase(), ';
    console.log(TAG + "Doing the work.");

    // New db var.
    let db = new sqlite3.Database(dbFileName);

    db.serialize(function () {
        // Create testing table.
        db.run('CREATE TABLE IF NOT EXISTS testing (first_name TEXT NOT NULL, last_name TEXT NOT NULL)', function (err) {
            console.log('Table testing: ', this);
            if (err) {
                console.log('Error creating table testing: ');
                console.log(err);
            };
        });
        // Create users table.
        db.run('CREATE TABLE IF NOT EXISTS users (email TEXT NOT NULL UNIQUE, username TEXT NOT NULL UNIQUE, hashed_password BLOB NOT NULL, salt BLOB, user_type TEXT NOT NULL, date_created TEXT NOT NULL)', function (err) {
            console.log('Table users: ', this);
            if (err) {
                console.log('Error creating table users: ');
                console.log(err);
            }
        });
    });

    db.close();
};


module.exports = { openDatabase, initializeDatabase }