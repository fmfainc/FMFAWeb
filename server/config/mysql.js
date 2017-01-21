let mysql = require('mysql');
let adminSessionIDs = require("../adminLoginIDs.js");
let connection = mysql.createConnection({
    port     : 3306,
    host     : "localhost",
    user     : "root",
    password : "root",
    database : "mydb"
});

module.exports = connection;