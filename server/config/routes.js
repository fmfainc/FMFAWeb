let panelControllers = require('../controllers/panelControllers.js');

let staticRoutes = {
	"/": "index.html",
	"/CustomJiraTraining": "CustomJiraTraining.html",
	"/JiraTraining": "JiraTraining.html",
	"/ScrumTraining": "ScrumTraining.html",
	"/SVPTITraining": "SVPTITraining.html",
	"/about": "About.html",
	"/calendar": "calendar.html",
	"/contact" : "Contact.html",
	"/blog" : "Blog.html"
};

module.exports = function(app){
	
	//Static HTML pages
	for(let route in staticRoutes){
		app.get(route, function(req, res){ res.sendFile(staticRoutes[route], {root: "client/static/html"} ); } );
	}

	//get routes
	app.get("/class_instances", panelControllers.getClassInstances);
	app.get("/locations", panelControllers.getLocations);
	app.get("/calendar_data", panelControllers.getCalendarData);
	app.get("/confirm_seating", panelControllers.confirmSeating);
	app.get("/adminpanel", panelControllers.adminpanel);
	app.get("/categories", panelControllers.getCategories);
	app.get("/adminlogin", panelControllers.adminlogin);
	app.get("/get_students_for_class/:id", panelControllers.getStudentsForClass);
	app.get("/class_descriptions", panelControllers.getClassDescriptions);

	//counting students
	app.get("/get_class_student_count", function(req, res){
		panelControllers.getClassStudentCount(req, res, false);
	});
	app.get("/get_class_waitlist_count", function(req, res){
		panelControllers.getClassStudentCount(req, res, true);
	});

	//post routes
	app.post("/delete_student", panelControllers.deleteStudent);
	app.post("/delete_scheduled_class", panelControllers.deleteScheduledClass);
	app.post("/get_one_student", panelControllers.getOneStudent);
	app.post("/sign_up", panelControllers.signUp);
	app.post("/edit_student", panelControllers.updateStudent);
	app.post("/edit_category", panelControllers.updateCategory);
	app.post("/schedule_class", panelControllers.scheduleClass);
	app.post("/edit_location", panelControllers.updateLocation);
	app.post("/edit_class_description", panelControllers.updateClassDescription);
	app.post("/edit_scheduled_class", panelControllers.updateScheduledClass);
	app.post("/delete_category", panelControllers.deleteCategory);
	app.post("/remove_student", panelControllers.removeStudent);
	app.post("/delete_class_description", panelControllers.deleteClassDescription);
	app.post("/delete_location", panelControllers.deleteLocation);
	app.post("/categories", panelControllers.addCategory);
	app.post("/locations", panelControllers.addLocation);
	app.post("/descriptions", panelControllers.addDescriptions);
	app.post("/adminlogin", panelControllers.adminloginPost);	
};