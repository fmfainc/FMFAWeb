let panelModel = require('../models/panelModel.js');
let adminSessionIDs = require("../adminLoginIDs.js");
let nodemailer = require("../config/emailer.js");
let fs = require("fs");
let safeEval = require('safe-eval');
let crypto = require("crypto");
let bcrypt = require("bcryptjs");
let os = require("os");

var exps = {
	email_codes : {},

	adminpanel: function(req, res){
		if(adminSessionIDs[req.sessionID] === true)
			res.sendFile("adminpanel.html", {root: "./"});
		else
			res.redirect("/adminlogin");
	},

	adminlogin: function(req, res){
		if(adminSessionIDs[req.sessionID] === true)
			res.redirect("adminpanel");
		else
			res.sendFile("adminlogin.html", {root: "client/static/html"});
		
		console.log(req.sessionID);
	},
	adminloginPost: function(req, res){
		//admin login
		//username: admin, password: fmf4__dev
		panelModel.validateLogin(req, res, function(err, rows, fields){
			if(err || rows[0] === undefined){
                console.log(err);
                res.redirect("/adminpanel");
            }
            else if(bcrypt.compareSync(req.body.password, rows[0].password)){
                req.session.name = rows[0].username;
                adminSessionIDs[req.sessionID] = true;
                res.redirect("/adminpanel");
            }
            else{
				res.sendFile("/static/html/adminlogin_wrong.html", {root: "client"});
			}
		});
	},

	signUp: function(req, res){
		
		var pattern = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		// var confirmORcancel= true;
		//validations
		var validationErrors = [];
		var valid = true;
		if(!pattern.test(req.body.email)){
			validationErrors.push("invalid email address");
			valid = false;
		}
		if(req.body.first_name.length < 1){
			validationErrors.push("first name required");
			valid = false;
		}
		if(req.body.last_name.length < 1){
			validationErrors.push("last name required");
			valid = false;
		}
		if(req.body.phone.length < 1){
			validationErrors.push("phone number required");
			valid = false;
		}

		if(valid === true){
		let email_crypto = crypto.randomBytes(48).toString("hex");
		

			exps.email_codes[req.body.email] = {signUpData: {
					email: req.body.email,
					first_name: req.body.first_name,
					last_name: req.body.last_name,
					phone: req.body.phone,
					class_instance_id: req.body.class_instance_id,
					code: email_crypto
				}
			};

			panelModel.getOneClassStudentCount(req, res, false, function(err, count){
				panelModel.getClassMaxStudent(req, res, function(err, max){
					var whichEmail;
					console.log(count[0]["count(*)"], max[0].max_students, "from controllers");
					if((count[0]["count(*)"]) >= max[0].max_students){
						console.log("class is full");
						whichEmail = "/email_content2.html";

					}
					else{
						console.log("class is available");
						whichEmail = "/email_content.html"
					}


				req.body.email_code = 
				"?email=" + req.body.email
				+ "&code=" + email_crypto;

				req.body.domain = "localhost:5000";
				
				var content = safeEval("`" + fs.readFileSync(__dirname + whichEmail, "utf8") + "`", req.body);
				// console.log(content);
				var mailOptions = {
				    from: '"FMFA Class Registration" <noreply.fmfa@gmail.com>', // sender address
				    to: req.body.email, // list of receivers
				    subject: "FMFA Class Registration", // Subject line
				    text: '', // plaintext body
				    html: content// html body
				};
				nodemailer.sendMail(mailOptions, function(error, info){
				    if(error){
				        return console.log(error);
				    }
				    console.log('Message sent: ' + info.response);
					});
					})
				})
			}


			else
			{
				console.log(validationErrors);
			}
			res.json(validationErrors);
	},

	confirmSeating: function(req, res){
		if(req.query.code == exps.email_codes[req.query.email].signUpData.code){
			if (req.query.confirm === 'true'){
				var email_data = {body: exps.email_codes[req.query.email].signUpData};
				panelModel.getOneClassStudentCount(email_data, res, false, function(err, count){
				panelModel.getClassMaxStudent(email_data, res, function(err, max){
					if((count[0]["count(*)"]) >= max[0].max_students){
						exps.email_codes[req.query.email].signUpData.waitlisted = true;
					}
					else{
						exps.email_codes[req.query.email].signUpData.waitlisted = false;
					}
					panelModel.confirmedCode(req, res, exps.email_codes[req.query.email].signUpData, function(err, result){
						//waitlist logic
						res.redirect("/calendar");
						//make new pages
					})
				})
				});
			}
			else{
				panelModel.cancelReg(req, res, exps.email_codes[req.query.email].signUpData, function(err, result){
					//nothing for now, but probably put a redirect here
					res.redirect("/calendar");
					//make new pages
				});
			}
		}
	},

	getCalendarData: function(req, res){
		panelModel.getCalendarData(req, res, function(err, rows, fields){
			tryJsonResponse(res, rows, err);
		});
	},

	getStudentsForClass: function(req, res){
		if(adminSessionIDs[req.sessionID] === true){
			panelModel.getStudentsForClass(req, res, function(err, rows, fields){
				tryJsonResponse(res, rows, err);
			});
		}
		else{
			res.status(401).send("plz login");
		}
	},

	getClassStudentCount: function(req, res, waitlisted){
		panelModel.getClassStudentCount(req, res, waitlisted, function(err, rows, fields){
			tryJsonResponse(res, rows, err);
        });
	},

	addCategory: function(req, res){
		panelModel.addCategory(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	deleteClassDescription: function(req, res){
		panelModel.deleteClassDescription(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	removeStudent : function(req, res){
		panelModel.removeStudent(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	deleteStudent: function(req, res){
		panelModel.deleteStudent(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	deleteScheduledClass: function(req, res){
		panelModel.deleteScheduledClass(req,res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	deleteCategory: function(req, res){
		panelModel.deleteCategory(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	deleteLocation: function(req, res){
		panelModel.deleteLocation(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	updateCategory: function(req, res){
		panelModel.updateCategory(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	updateScheduledClass: function(req, res){
		panelModel.updateScheduledClass(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	updateLocation: function(req, res){
		panelModel.updateLocation(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	updateClassDescription: function(req, res){
		panelModel.updateClassDescription(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	getCategories: function(req, res){
		panelModel.getCategories(req, res, function(err, rows, fields){
			tryJsonResponse(res, rows, err);
		});
	},

	updateStudent: function(req, res){
		panelModel.updateStudent(req, res, function(err, rows, fields){
			tryJsonResponse(res, rows, err);
		});
	},

	getOneStudent: function(req, res){
		panelModel.getOneStudent(req, res, function(err, rows, fields){
			tryJsonResponse(res, rows, err);
		});
	},

	getClassInstances: function(req, res){
		panelModel.getClassInstances(req, res, function(err, rows, fields){
	        if(err){
	            res.json(err);
	        }
	        else{
	            for(let item of rows)
	            {
	                for(let key in item)
	                {
	                    if(key === "start_date" || key === "end_date")
	                    {
	                        item[key] = item[key].toString();
	                        if(key == "start_date"){
	                            item["start_time"] = item[key].slice(15, 21);
	                                let hour = parseInt(item["start_time"].slice(0, 3));
	                                if(hour >= 12){
	                                    item["start_time"] += " pm";
	                                    hour %= 12;
	                                    if(hour == 0){
	                                        hour = 12;
	                                    }
	                                    item["start_time"] = hour + item["start_time"].slice(3);
	                                }
	                                else{
	                                    item["start_time"] += " am"
	                                }
	                            item[key] = item[key].slice(0, 15);
	                        }
	                        else{
	                            item[key] = item[key].slice(15, 21);
	                            let hour = parseInt(item[key].slice(0, 3));
                                if(hour >= 12){
                                    item[key] += " pm";
                                    hour %= 12;
                                    if(hour == 0){
                                        hour = 12;
                                    }
                                    item[key] = hour + item[key].slice(3);
                                }
                                else
                                {
                                    item[key] += " am"
                                }
                            }
	                    }
	                }
	            }
	        }
	        res.json(rows);
	    });
	},

	getLocations: function(req, res){
		panelModel.getLocations(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	addLocation: function(req, res){
		panelModel.addLocation(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	addDescriptions: function(req, res){
		panelModel.addDescriptions(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	getClassDescriptions: function(req, res){
		panelModel.getClassDescriptions(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	},

	scheduleClass: function(req, res){
		panelModel.scheduleClass(req, res, function(err, result){
			tryJsonResponse(res, result, err);
		});
	}
}

function tryJsonResponse(res, result, err){
	console.log(result, err);
	if(err){
		res.json(err);
	}
	else{
	    res.json(result);
	}
}

module.exports = exps;
