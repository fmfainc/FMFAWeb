let bcrypt = require("bcryptjs");
let crypto = require("crypto");
let adminSessionIDs = require("../adminLoginIDs.js");
let connection = require("../config/mysql.js");

module.exports = {
    getCalendarData: function(req, res, callback){
        let columns = "class_descriptions.class_name, class_descriptions.class_description, categories.category_name, categories.category_description, class_instances.id as class_instance_id, class_instances.class_descriptions_id, class_instances.min_students, class_instances.max_students, EXTRACT(YEAR FROM start_date) AS date_year, EXTRACT(MONTH FROM start_date) AS date_month, EXTRACT(DAY FROM start_date) AS date_day, EXTRACT(HOUR FROM start_date) AS date_hour, EXTRACT(MINUTE FROM start_date) AS date_minute, locations.location_description, locations.location_name"
        let query = `select ${columns} from class_instances join locations on class_instances.locations_id = locations.id join class_descriptions on class_instances.class_descriptions_id = class_descriptions.id join categories on class_descriptions.categories_id = categories.id`;
        
        connection.query(query, callback);
    },

    getClassStudentCount: function(req, res, waitlisted, callback){

        let wl = (waitlisted === true)?"true":"not true";
        let query = `SELECT count(*), classes_has_students.class_instance_id, class_descriptions.class_name from classes_has_students join class_instances on classes_has_students.class_instance_id = class_instances.id join class_descriptions on class_instances.class_descriptions_id = class_descriptions.id WHERE classes_has_students.waitlisted is ${wl} GROUP BY class_instance_id`;
        
        connection.query(query, callback);
    },

    validateLogin: function(req, res, callback){
        let query = `SELECT * FROM admin_logins WHERE username = ${addQuotes(req.body.username)}`;
        connection.query(query, callback);
    },

    addCategory: function(req, res, callback){
        let query = insertQuery("categories", req.body);
        connection.query(query, callback);
    },

    deleteCategory: function(req, res, callback){
        let query = `DELETE FROM categories WHERE id = ${req.body.id}`;
        connection.query(query, callback);
    },

    deleteStudent: function(req, res, callback){
        let query1 = `DELETE FROM classes_has_students where student_id = ${req.body.id}`;
        let query2 = `DELETE FROM students where id = ${req.body.id}`;
            connection.query(query1, function(err, result){
            if(err)
                res.json(err);
            else
                connection.query(query2, callback);
        });
    },
    removeStudent: function(req, res, callback){
        let query = `DELETE FROM classes_has_students where student_id = ${req.body.id}`;
        connection.query(query, callback)
    },
        
    cancelReg: function(req, res, data, callback){
        let subQuery =  `(SELECT id FROM students WHERE email= ${addQuotes(data.email)} LIMIT 1)`;
        let query = `DELETE FROM classes_has_students WHERE student_id = ${subQuery}`;
        connection.query(query, callback);
    },

    confirmedCode: function(req, res, data, callback){
        let query1 = `SELECT id FROM students WHERE email = ${addQuotes(req.query.email)}`;
        connection.query(query1, function(err, result1){
            let query2;
            let insert = true;
            if(result1.length === 0 && err === null){
                query2 = insertQuery("students", {first_name: data.first_name, last_name: data.last_name, email: data.email, phone: data.phone});
            }
            else if(err === null){
                insert = false;
                query2 = `UPDATE students set first_name = ${addQuotes(data.first_name)}, last_name = ${addQuotes(data.last_name)}, phone = ${addQuotes(data.phone)} where id= ${result1[0].id}`;
            }

            connection.query(query2, function(err, result2){
                let insertData = {
                    class_instance_id: data.class_instance_id,
                    student_id: (insert)?result2.insertId:result1[0].id,
                    register_date: "now()"
                };

                let query3 = `INSERT INTO classes_has_students (class_instance_id, student_id, register_date) VALUES(${insertData.class_instance_id}, ${insertData.student_id}, ${insertData.register_date})`;
                
                connection.query(query3, callback);
            });
        });
    },

    deleteScheduledClass: function(req, res, callback){
        let query = `DELETE FROM class_instances where id = ${req.body.id}`;
        connection.query(query, callback);
    },

    deleteClassDescription: function(req, res, callback){
        let query = `DELETE FROM class_descriptions where id = ${req.body.id}`;
        connection.query(query, callback);
    },

    deleteLocation: function(req, res, callback){
        let query = `DELETE FROM locations WHERE id = ${req.body.id}`;
        connection.query(query, callback);
    },

    updateCategory: function(req, res, callback){
        let edit = {category_name: "", category_description: ""};
        
        if(req.body.category_name !== undefined)
            edit.category_name = `category_name = ${addQuotes(req.body.category_name)}, `;
        if(req.body.category_description !== undefined)
            edit.category_description = `category_description = ${addQuotes(req.body.category_description)}, `;

        let query = `UPDATE categories set ${edit.category_name} ${edit.category_description} updated_at = now() WHERE id = ${req.body.id}`;

        connection.query(query, callback);
    },
    
    scheduleClass: function(req, res, callback){
        let start_date = dateTimeAdjustHours(`${req.body.start_date.slice(0, 10)} ${req.body.start_time.slice(11, 19)}`, -8);
        let end_date = dateTimeAdjustHours(`${req.body.start_date.slice(0, 10)} ${req.body.end_time.slice(11, 19)}`, -8);
        let insert_body = {
            locations_id : req.body.locations_id,
            class_descriptions_id : req.body.class_descriptions_id,
            start_date : start_date,
            end_date: end_date,
            min_students : req.body.min_students,
            max_students : req.body.max_students
        }
        let query = insertQuery("class_instances", insert_body);

        connection.query(query, callback);
    },

    updateLocation: function(req, res, callback){
        let edit = {location_name: "", location_description: ""};
        
        if(req.body.location_name !== undefined){
            edit.location_name = `location_name = ${addQuotes(req.body.location_name)}, `;
        }
        if(req.body.location_description !== undefined){
            edit.location_description = `location_description = ${addQuotes(req.body.location_description)}, `;
        }

        let query = `UPDATE locations set ${edit.location_name} ${edit.location_description} updated_at = now() WHERE id = ${req.body.id}`;
        connection.query(query, callback);
    },

    updateStudent: function(req, res, callback){
        let edit = {first_name: "", last_name: "", email: "", phone: "", waitlisted: ""};

        for(let key in edit){
            if(req.body[key] !== undefined){
                edit[key] = `${key} = ${addQuotes(req.body[key])}, `;
            }
        }

        let query = `UPDATE students JOIN classes_has_students ON students.id = classes_has_students.student_id set ${edit.first_name} ${edit.last_name} ${edit.email} ${edit.phone} ${edit.waitlisted} updated_at = now() WHERE classes_has_students.student_id = ${req.body.student_id} and classes_has_students.class_instance_id = ${req.body.class_instance_id}`;
        connection.query(query, callback);
    },

    updateClassDescription: function(req, res, callback){
        let subQuery = `(SELECT id FROM categories WHERE category_name=${req.body.category} LIMIT 1), `;

        let edit = {class_name: "", class_description: "", categories_id: ""};
        
        if(req.body.class_name !== undefined){
            edit.class_name = `class_name = ${addQuotes(req.body.class_name)}, `;
        }
        if(req.body.class_description !== undefined){
            edit.class_description = `class_description = ${addQuotes(req.body.class_description)}, `;
        }
        if(req.body.category !== undefined){
            edit.categories_id = `categories_id = (SELECT id FROM categories WHERE category_name=${req.body.category} LIMIT 1), `;
        }

        let query = `UPDATE class_descriptions set ${edit.class_name} ${edit.class_description} ${edit.categories_id} updated_at = now() WHERE id = ${req.body.id}`;

        connection.query(query, callback);
    },

    updateScheduledClass: function(req, res, callback){
        let startTime = trySlice(req.body.start_date, 0, 10);
        let newStartDateTime = `${startTime} ${trySlice(req.body.start_time, 11, 19)}`;
        let insertnewStartDateTime = dateTimeAdjustHours(newStartDateTime, -8);
        let newEndTimeBefore = trySlice(req.body.end_time, 11, 19);
        let imTiredOfThisShit = `${startTime} ${newEndTimeBefore}`;
        let newEndTimeAfter = dateTimeAdjustHours(imTiredOfThisShit, -8);

        let edit_class_instances_location_id = (req.body.location_id != undefined)?`class_instances.locations_id = ${req.body.location_id},`:"";
        let edit_class_instances_description_id = (req.body.class_description_id != undefined)?`class_instances.class_descriptions_id = ${req.body.class_description_id},`:"";
        let edit_class_instances_start_date = (req.body.start_date != undefined)?`class_instances.start_date = ${insertnewStartDateTime},`:"";
        let edit_class_instances_end_date = (req.body.end_time  != undefined)?`class_instances.end_date = ${newEndTimeAfter},`:"";
        let edit_class_instances_min_students = (req.body.min_students != undefined)?`class_instances.min_students = ${req.body.min_students},`:"";
        let edit_class_instances_max_students = (req.body.max_students != undefined)?`class_instances.max_students = ${req.body.max_students},`:"";

        let query = `UPDATE class_instances SET ${edit_class_instances_location_id} ${edit_class_instances_description_id} ${edit_class_instances_start_date} ${edit_class_instances_end_date} ${edit_class_instances_min_students} ${edit_class_instances_max_students} updated_at = NOW() WHERE id = ${req.body.id}`; 

        connection.query(query, callback);
    },
    
    addLocation: function(req, res, callback){
        let query = insertQuery("locations", req.body);
        connection.query(query, callback);  
    },

    addDescriptions: function(req, res, callback){
        let subQuery = `(SELECT id FROM categories WHERE category_name=${addQuotes(req.body.class_category)} LIMIT 1)`;
        let query = `INSERT INTO class_descriptions (class_name, categories_id, class_description) VALUES(${addQuotes(req.body.class_name)}, ${subQuery}, ${addQuotes(req.body.class_description)})`;
        console.log(query);
        connection.query(query, callback);
    },

    getCategories: function(req, res, callback){
        connection.query("SELECT * FROM categories", callback);
    },

    getOneStudent: function(req, res, callback){
        connection.query("SELECT * FROM classes_has_students JOIN students ON students.id = classes_has_students.student_id", callback);
    },

    getClassDescriptions: function(req, res, callback){
        let query = "SELECT class_descriptions.id, class_descriptions.class_name, class_descriptions.class_description, categories.category_name FROM class_descriptions JOIN categories ON categories.id = class_descriptions.categories_id";
        console.log(query);
        connection.query(query, callback);
    },

    getClassInstances: function(req, res, callback){          
        let query = "SELECT class_instances.id as Class_Instances_ID, class_instances.start_date, class_instances.end_date, class_instances.max_students, class_instances.min_students, class_descriptions.class_name,locations.location_name FROM class_instances INNER JOIN class_descriptions ON class_descriptions.id = class_instances.class_descriptions_id INNER JOIN locations ON class_instances.locations_id = locations.id";
        connection.query(query, callback);
    },

	getLocations: function(req, res, callback){
        connection.query("SELECT * FROM locations", callback);
	},

	getStudentsForClass: function(req, res, callback){
        connection.query(`SELECT * FROM classes_has_students JOIN students ON students.id = classes_has_students.student_id WHERE class_instance_id = ${req.params.id}`, callback);
    }
}

// HELPER FUNCTIONS BELOW

function trySlice(str, start, end)
{
    if(str !== undefined){
       return str.slice(start, end);
    }
    return undefined;
}

function addQuotes(strArr)
{
    if(typeof strArr != "object")
        strArr = [strArr];
    strArr.forEach(function(element, index, array) {
        let temp = "'";
        if(element !== undefined)
        {
            let current = "" + element;
            for(ch of current)
            {
                if(ch !== "'")
                    temp += ch;
                else
                    temp += "''";
            }
        }
        temp += "'";
        strArr[index] = temp;
    });
    return strArr;
}

function forInLoop(object){
	for (var key in object){
		console.log(key + "=" + object[key]);
	}
};


function insertQuery(tableName, queryobj)
{
	let columns = " (" + Object.keys(queryobj).join(", ") + ")";
	let values = " VALUES (" + addQuotes(getObjValues(queryobj)).join(", ") + ")";
	let query = "INSERT INTO " + tableName + columns + values;
	return query;
};

function queryException(exception, query)
{
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log("Database error:", exception);
    console.log("-----");
    console.log("-----");
	console.log("Query involved:", query);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    res.status(500).send("DB error");
};

function getObjValues(obj)
{
	let vals = [];
	for(key in obj)
	{
		vals.push(obj[key]);
	}
	return vals;
};

function dateTimeAdjustHours(dateStr, hourAdjustment)
{
	let hour = (Number.parseInt(dateStr.slice(11, 13)) + hourAdjustment)%24;
	let result = dateStr.slice(0, 11) + hour + dateStr.slice(13);
	return result;
};