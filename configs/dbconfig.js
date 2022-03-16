var sqlite3 = require('sqlite3').verbose();

function openDatabase() {
    return new sqlite3.Database('./configs/marketdb');
};


module.exports = { openDatabase }