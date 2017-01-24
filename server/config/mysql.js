let mysql = require('mysql');
let adminSessionIDs = require("../adminLoginIDs.js");
let stdin = process.openStdin();

let exps = {

	pool: mysql.createPool({
	    port     : 3306,
	    host     : "localhost",
	    user     : "root",
	    password : "root",
	    database : "mydb"
	}),

	query: function(qury, callback){
		try{
			exps.pool.getConnection(function(err, connection) {
				if(connection){
					connection.query(qury, function (error, results, fields) {
					callback(error, results, fields);
					if(error && error.fatal){
						tryDestroy(connection);
					}
					else{
						console.log("nonfatal mysql error. releasing connection back to pool.");
						console.log(error);
						connection.release();
					}
					});
				}
				else{
					if(err && err.fatal){
						tryDestroy(err);
					}
				}
			});
		}
		catch(e)
		{
			console.log(e);
		}
	}

};

stdin.addListener("data", function(input) {
    let strInput = input.toString().trim();
    let cmdArr = strInput.split(" ");
    let connPool = exps.pool;
    let config = connPool.config.connectionConfig;
    if(cmdArr[0] === "mysql"){
    	if(cmdArr.length === 3){
    		config[cmdArr[1]] = cmdArr[2];
    		console.log(`mysql settings changed. ${cmdArr[1]} set to ${cmdArr[2]}`);
    	}
    	else if (cmdArr[1] === "?")
    	{
    		console.log(config);
    	}
    	else
    	{
    		console.log("bad command for mysql settings change.", "proper format is 'mysql <property> <value>'.", "for example, 'mysql password hunter2'");
    	}
    }
  });

function tryDestroy(connection){
	try{
		console.log("fatal mysql error. destroying connection.")
		connection.destroy();
	}
	catch(e){
		console.log("exception while trying to destroy a connection.", e);
	}
}

exps.query("SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))", function(err, result){
	// console.log(err, result);
});

module.exports = exps;