var sqlite3 = require('sqlite3').verbose();
var dbFileName = './configs/marketdb.db';

function openDatabase() {
    return new sqlite3.Database(dbFileName);
};

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
        db.run('CREATE TABLE IF NOT EXISTS users (email TEXT NOT NULL UNIQUE, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, date_created INTEGER NOT NULL)', function (err) {
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