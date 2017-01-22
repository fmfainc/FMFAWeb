let mysql = require('mysql');
let bcrypt = require("bcryptjs");
let crypto = require("crypto");
let adminSessionIDs = require("../adminLoginIDs.js");
let connection = require("../config/mysql.js");

module.exports = {
    getCalendarData: function(req, res){
        let columns = "class_descriptions.class_name, class_descriptions.class_description, categories.category_name, categories.category_description, class_instances.id as class_instance_id, class_instances.class_descriptions_id, class_instances.min_students, class_instances.max_students, EXTRACT(YEAR FROM start_date) AS date_year, EXTRACT(MONTH FROM start_date) AS date_month, EXTRACT(DAY FROM start_date) AS date_day, EXTRACT(HOUR FROM start_date) AS date_hour, EXTRACT(MINUTE FROM start_date) AS date_minute, locations.location_description, locations.location_name"
        let query = "select "+ columns +" from class_instances join locations on class_instances.locations_id = locations.id join class_descriptions on class_instances.class_descriptions_id = class_descriptions.id join categories on class_descriptions.categories_id = categories.id";
        
        try
        {
            connection.query(query, function(err, rows, fields){
                if(err){
                    console.log(err);
                    res.json([]);
                }
                else
                {
                    res.json(rows);
                }
            });
        }
        catch (e)
        {
            printQueryException(e, query);
            res.json([]);
        }
    },

    getClassStudentCount: function(req, res, waitlisted){

        let wl = (waitlisted === true)?"true":"not true";
        let query = `select count(*), classes_has_students.class_instance_id, class_descriptions.class_name from classes_has_students join class_instances on classes_has_students.class_instance_id = class_instances.id join class_descriptions on class_instances.class_descriptions_id = class_descriptions.id where classes_has_students.waitlisted is ${wl}`;
        
        try
        {
            connection.query(query, function(err, rows, fields){
                if(err){
                    res.json(err);
                }
                else{
                    console.log(rows);
                    res.json(rows);
                }
            });
        }
        catch (e)
        {
            printQueryException(e, query);
            res.json([]);
        }

    },

    validateLogin: function(req, res){
        let query = "select * from admin_logins where username = '"+ req.body.username +"'";
        try
        {
            connection.query(query, function(err, rows, fields){
                //console.log(req.body);
                //username: admin, password: fmf4__dev
                if(err || rows[0] === undefined)
                {
                    console.log(err);
                    res.redirect("/adminpanel");
                }
                else if(bcrypt.compareSync(req.body.password, rows[0].password))
                {
                    req.session.name = rows[0].username;
                    adminSessionIDs[req.sessionID] = true;
                    res.redirect("/adminpanel");
                }
                else
                    res.sendFile("/static/html/adminlogin_wrong.html", {root: "client"});
            });
        }
        catch (e)
        {
            queryException(e, query);
        }
        return false;
    },

    addCategory: function(req, res)
    {
        let query;
        try
        {
            query = insertQuery("categories", req.body);
            connection.query(query, function(err, result){
                if(err)
                    res.json(err);
                else
                    res.json(result); //res goes to the frontend directly
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },

    deleteCategory: function(req, res)
    {
        console.log(req.body.id);
        let query = "DELETE FROM categories where id = " + req.body.id;
        console.log(query);
        try
        {
            connection.query(query, function(err, result){
                console.log(err, result);
                if(err)
                    res.json(err);
                else
                    res.json(result); //res goes to the frontend directly
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },
deleteStudent: function(req, res)
    {
        console.log(req.body.id);
        let query1 = "DELETE FROM classes_has_students where student_id = " + req.body.id;
        let query2 = "DELETE FROM students where id = " + req.body.id;
        // console.log(query);
        try
        {
            connection.query(query1, function(err, result){
                console.log(err, result);
                if(err)
                    res.json(err);
                else
                    connection.query(query2, function(err, result){
                        console.log(err, result);
                        if(err)
                            res.json(err);
                        else
                            res.json(result); //res goes to the frontend directly
                    });
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },
removeStudent: function(req, res)
    {
        console.log(req.body.id, "!!!!");
        let query = "DELETE FROM classes_has_students where student_id = " + req.body.id;
        console.log(query, "!!!");
        try
        {
            connection.query(query, function(err, result){
                console.log(err, result);
                if(err)
                    res.json(err);
                else
                    res.json(result); //res goes to the frontend directly
                });

        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },
    confirmed_code: function(req, res, data){
        let query1 = "SELECT id FROM students WHERE email = " + addQuotes(req.query.email);
        try
        {
            connection.query(query1, function(err, result1){
                console.log(data, "%%%");
                console.log(err, result1, "result1");
                let query2;
                let insert = true;
                if(result1.length === 0 && err === null)
                {
                    query2 = insertQuery("students", {first_name: data.first_name, last_name: data.last_name, email: data.email, phone: data.phone});
                    console.log(result2.insertId, "insert");
                }
                else if(err === null)
                {
                    insert = false;
                    query2 = `UPDATE students set first_name = ${addQuotes(data.first_name)}, last_name = ${addQuotes(data.last_name)}, phone = ${addQuotes(data.phone)} where id= ${result1[0].id}`;
                    console.log(result1[0].id, "update");
                }

                connection.query(query2, function(err, result2){
                    let insertData = {
                        class_instance_id: data.class_instance_id,
                        student_id: (insert)?result2.insertId:result1[0].id,
                        register_date: "now()"
                    };
                    console.log(result1);
                    let query3 = `INSERT INTO classes_has_students (class_instance_id, student_id, register_date) VALUES(${insertData.class_instance_id}, ${insertData.student_id}, ${insertData.register_date})`;
                    console.log(err, result2, "result2");
                    console.log(query3);
                    
                    connection.query(query3, function(err, result3){
                        console.log(err, result3, "888");
                    });
                });
            });
        }
        catch(e)
        {
            queryException(e, query);
            res.json([]);
        }
    },

    deleteScheduledClass: function(req, res)
    {
        // console.log(req.body, "delete sccheduled class from the BE");
        let query = "DELETE FROM class_instances where id = " + req.body.id;
        console.log(query);
        try
        {
            connection.query(query, function(err, result){
                console.log(err, result);
                if(err)
                    res.json(err);
                else
                    res.json(result); //res goes to the frontend directly
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },

    deleteClassDescription: function(req, res)
    {
        console.log(req.body.id);
        let query = "DELETE FROM class_descriptions where id = " + req.body.id;
        console.log(query);
        try
        {
            connection.query(query, function(err, result){
                console.log(err, result);
                if(err)
                    res.json(err);
                else
                    res.json(result); //res goes to the frontend directly
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },

    deleteLocation: function(req, res)
    {
        console.log(req.body.id, "delete location from modal");
        let query = "DELETE FROM locations where id = " + req.body.id;
        console.log(query);
        try
        {
            connection.query(query, function(err, result){
                console.log(err, result);
                if(err)
                    res.json(err);
                else
                    res.json(result); //res goes to the frontend directly
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },

    updateCategory: function(req, res)
    {
        let edit = {category_name: "", category_description: ""};
        
        if(req.body.category_name !== undefined)
            edit.category_name = `category_name = ${addQuotes(req.body.category_name)}, `;
        if(req.body.category_description !== undefined)
            edit.category_description = `category_description = ${addQuotes(req.body.category_description)}, `;

        let query = `UPDATE categories set ${edit.category_name} ${edit.category_description} updated_at = now() WHERE id = ${req.body.id}`;


        console.log(query);
        try
        {
            connection.query(query, function(err, result){
                // console.log(err, result);
                if(err)
                    res.json(err);
                else
                    res.json(result); //res goes to the frontend directly
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },
    
    scheduleClass: function(req, res)
    {
        var start_date = dateTimeAdjustHours(req.body.start_date.slice(0, 10) + " " + req.body.start_time.slice(11, 19), -8);
        var end_date = dateTimeAdjustHours(req.body.start_date.slice(0, 10) + " " + req.body.end_time.slice(11, 19), -8);
        var insert_body = {
            locations_id : req.body.locations_id,
            class_descriptions_id : req.body.class_descriptions_id,
            start_date : start_date,
            end_date: end_date,
            min_students : req.body.min_students,
            max_students : req.body.max_students
        }
        let query = insertQuery("class_instances", insert_body);
        // console.log(query);
        try
        {
            connection.query(query, function(err, result){
                // console.log(err, result);
                if(err)
                    res.json(err);
                else
                    res.json(result + "add class from model"); //res goes to the frontend directly
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },

    updateLocation: function(req, res)
    {
        let edit = {location_name: "", location_description: ""};
        
        if(req.body.location_name !== undefined)
            edit.location_name = `location_name = ${addQuotes(req.body.location_name)}, `;
        if(req.body.location_description !== undefined)
            edit.location_description = `location_description = ${addQuotes(req.body.location_description)}, `;

        let query = `UPDATE locations set ${edit.location_name} ${edit.location_description} updated_at = now() WHERE id = ${req.body.id}`;


        try
        {
            connection.query(query, function(err, result){
                console.log(err, result);
                if(err)
                    res.json(err);
                else
                    res.json(result); //res goes to the frontend directly
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },

    updateStudent: function(req, res)
    {
        let edit = {first_name: "", last_name: "", email: "", phone: "", waitlisted: ""};

        for(let key in edit)
        {
            if(req.body[key] !== undefined)
            {
                edit[key] = `${key} = ${addQuotes(req.body[key])}, `;
            }
        }

        let query = `UPDATE students JOIN classes_has_students ON students.id = classes_has_students.student_id set ${edit.first_name} ${edit.last_name} ${edit.email} ${edit.phone} ${edit.waitlisted} updated_at = now() WHERE classes_has_students.student_id = ${req.body.student_id} and classes_has_students.class_instance_id = ${req.body.class_instance_id}`;

        console.log(query, "----update student");

        try
        {
            connection.query(query, function(err, result){
                console.log(err, result);
                if(err)
                    res.json(err);
                else
                    res.json(result);
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }


    },

    updateClassDescription: function(req, res)
    {
        console.log(req.body);
        let subQuery = "`(SELECT id FROM categories WHERE category_name=${req.body.category} LIMIT 1), `";

        let edit = {class_name: "", class_description: "", categories_id: ""};
        
        if(req.body.class_name !== undefined)
            edit.class_name = `class_name = ${addQuotes(req.body.class_name)}, `;
        if(req.body.class_description !== undefined)
            edit.class_description = `class_description = ${addQuotes(req.body.class_description)}, `;
        if(req.body.category !== undefined)
            edit.categories_id = `categories_id = (SELECT id FROM categories WHERE category_name=${req.body.category} LIMIT 1), `;

        let query = `UPDATE class_descriptions set ${edit.class_name} ${edit.class_description} ${edit.categories_id} updated_at = now() WHERE id = ${req.body.id}`;

        console.log(query);
        try
        {
            connection.query(query, function(err, result){
                console.log(err, result);
                if(err)
                    res.json(err);
                else
                    res.json(result); //res goes to the frontend directly
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },

    updateScheduledClass: function(req, res)
    {
        // console.log(req.body, "444");
        var startTime = trySlice(req.body.start_date, 0, 10);
        var newStartDateTime = `${startTime} ${trySlice(req.body.start_time, 11, 19)}`;
        var insertnewStartDateTime = dateTimeAdjustHours(newStartDateTime, -8);
        var newEndTimeBefore = trySlice(req.body.end_time, 11, 19);
        var imTiredOfThisShit = `${startTime} ${newEndTimeBefore}`;
        var newEndTimeAfter = dateTimeAdjustHours(imTiredOfThisShit, -8);

        var edit_class_instances_location_id = (req.body.location_id != undefined)?`class_instances.locations_id = ${req.body.location_id},`:"";
        var edit_class_instances_description_id = (req.body.class_description_id != undefined)?`class_instances.class_descriptions_id = ${req.body.class_description_id},`:"";
        var edit_class_instances_start_date = (req.body.start_date != undefined)?`class_instances.start_date = ${insertnewStartDateTime},`:"";
        var edit_class_instances_end_date = (req.body.end_time  != undefined)?`class_instances.end_date = ${newEndTimeAfter},`:"";
        var edit_class_instances_min_students = (req.body.min_students != undefined)?`class_instances.min_students = ${req.body.min_students},`:"";
        var edit_class_instances_max_students = (req.body.max_students != undefined)?`class_instances.max_students = ${req.body.max_students},`:"";

        let query = `UPDATE class_instances SET ${edit_class_instances_location_id} ${edit_class_instances_description_id} ${edit_class_instances_start_date} ${edit_class_instances_end_date} ${edit_class_instances_min_students} ${edit_class_instances_max_students} updated_at = NOW() WHERE id = ${req.body.id}`; 
        
        console.log(query, "666");
        // console.log("555");
        try
        {
            connection.query(query, function(err, result){
                console.log(err, result);
                if(err)
                    res.json(err);
                else
                    res.json(result); //res goes to the frontend directly
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },
    
    addLocation: function(req, res)
    {
        let query;
        try
        {
            query = insertQuery("locations", req.body);
            connection.query(query, function(err, result){
                if(err)
                    res.json(err);
                else
                    res.json(result); //res goes to the frontend directly
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },

    addDescriptions: function(req, res){
        var subQuery = "(SELECT id FROM categories WHERE category_name='"+ req.body.class_category +"' LIMIT 1)";
        connection.query(subQuery, function(err, result){
            var queryObj = {class_name: req.body.class_name, categories_id: ""+result[0].id, class_description: req.body.class_description};
            let query;
            try
            {
                query = insertQuery("class_descriptions", queryObj);
                connection.query(query, function(err, result){
                    if(err)
                        res.json(err);
                    else{
                        res.json(result); 
                    }
                });
            }
            catch (e)
            {
                queryException(e, query);
                res.json([]);
            }
        })
    },

    getCategories: function(req, res)
    {
        try
        {
            connection.query("SELECT * FROM categories", function(err, rows, fields){
                if(err)
                    res.json(err);
                else
                    res.json(rows);
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },

    getOneStudent: function(req, res)
    {
        console.log(req.body);
        try
        {
            connection.query("SELECT * FROM classes_has_students JOIN students ON students.id = classes_has_students.student_id", function(err, rows, fields){
                if(err)
                    res.json(err);
                else
                    res.json(rows, "getOneStudent from BE model");
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },

    getClassDescriptions: function(req, res)
    {
        try
        {
            connection.query("SELECT class_descriptions.id, class_descriptions.class_name, class_descriptions.class_description, categories.category_name FROM class_descriptions JOIN categories ON categories.id = class_descriptions.categories_id", function(err, rows, fields){
                if(err)
                    res.json(err);
                else
                {
                    res.json(rows);
                }
            });
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },

    getClassInstances: function(req, res)
    {
        try
        {            
            var insert_query = "SELECT class_instances.id as Class_Instances_ID, class_instances.start_date, class_instances.end_date, class_instances.max_students, class_instances.min_students, class_descriptions.class_name,locations.location_name FROM class_instances INNER JOIN class_descriptions ON class_descriptions.id = class_instances.class_descriptions_id INNER JOIN locations ON class_instances.locations_id = locations.id";
            connection.query(insert_query, function(err, rows, fields){
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
                                    //console.log(parseInt(item[key].slice(0,3)));
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
        }
        catch (e)
        {
            queryException(e, query);
            res.json([]);
        }
    },

	getLocations: function(req, res)
	{
		try
		{
			connection.query("SELECT * FROM locations", function(err, rows, fields){
				if(err)
					res.json(err);
				else
					res.json(rows);
			});
		}
		catch (e)
		{
			queryException(e, query);
			res.json([]);
		}
	},

	getStudentsForClass: function(req, res)
	{
        let id = req.params.id;
		try
		{
			connection.query("SELECT * FROM classes_has_students JOIN students ON students.id = classes_has_students.student_id WHERE class_instance_id = " + id, function(err, rows, fields){
				if(err)
					res.json(err);
				else
					res.json(rows);
			});
		}
		catch (e)
		{
			queryException(e, query);
			res.json([]);
		}
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
    res.status(500).send("DB error:", exception);
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