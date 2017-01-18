//modules
let express = require("express");
let path = require("path");
let bodyParser = require("body-parser");
let mysql = require("mysql");
//let bcrypt = require("bcryptjs");
let session = require("express-session");
let crypto = require("crypto");
let app = express();
let port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, '/client')));

// console.log(__dirname + '/client');

app.use(session({
  secret: crypto.randomBytes(48).toString("hex"),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true}
}));

require('./server/config/routes.js')(app);

let server = app.listen(port, function()
{
	console.log("listening on port", port);
});


//currently logged in admin session IDs









