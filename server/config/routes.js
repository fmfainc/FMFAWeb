var panelControllers = require('../controllers/panelControllers.js');

var staticRoutes = {
	"/": "index.html",
	"/CustomJiraTraining": "CustomJiraTraining.html",
	"/JiraTraining": "JiraTraining.html",
	"/ScrumTraining": "ScrumTraining.html",
	"/SVPTITraining": "SVPTITraining.html",
	"/about": "about.html",
	"/calendar": "calendar.html",
	"/contact" : "contact.html",
	"/blog" : "blog.html"
};

module.exports = function(app){
	
	for(let route in staticRoutes)
	{
		app.get(route, function(req, res){
			res.sendFile(staticRoutes[route], {root: "client/static/html"});
		});
	}

	app.get("/calendar_data", panelControllers.getCalendarData);
	app.get("/confirm_seating", panelControllers.confirmSeating);

	app.get("/adminpanel", panelControllers.adminpanel);
	app.get("/categories", panelControllers.getCategories);

	app.get("/adminlogin", function(req, res){
		panelControllers.adminlogin(req, res);
	});
	app.post("/delete_student", function(req, res){
		panelControllers.deleteStudent(req, res);
	});
	app.post("/delete_scheduled_class", function(req, res){
		panelControllers.delete_scheduled_class(req, res);
	});

	app.get("/get_students_for_class/:id", function(req, res){
		panelControllers.getStudentsForClass(req, res);
	});

	app.get("/get_class_student_count", function(req, res){
		panelControllers.getClassStudentCount(req, res, false);
	});

	app.get("/get_class_waitlist_count", function(req, res){
		panelControllers.getClassStudentCount(req, res, true);
	});

	app.get("/class_descriptions", function(req, res)
	{
		panelControllers.getClassDescriptions(req, res);
	});

	app.get("/students", function(req, res)
	{
		panelControllers.getStudents(req, res);
	});

	app.post("/get_one_student", function(req, res)
	{
		panelControllers.getOneStudent(req, res);
	});

	app.post("/sign_up", function(req, res)
	{
		panelControllers.signUp(req, res);
	});

	app.get("/class_instances", function(req, res)
	{
		panelControllers.getClassInstances(req, res);
	});

	app.get("/locations", function(req, res)
	{
		panelControllers.getLocations(req, res);
	});
	app.post("/edit_student", panelControllers.updateStudent);
	app.post("/edit_category", panelControllers.updateCategory);
	app.post("/schedule_class", panelControllers.scheduleClass);
	app.post("/edit_location", panelControllers.updateLocation);
	app.post("/edit_class_description", panelControllers.updateClassDescription);
	app.post("/edit_scheduled_class", panelControllers.updateScheduledClass);
	app.post("/delete_category", panelControllers.deleteCategory);
	app.post("/remove_student", panelControllers.remove_student);
	app.post("/delete_class_description", panelControllers.deleteClassDescription);
	app.post("/delete_location", panelControllers.deleteLocation);
	app.post("/categories", panelControllers.addCategory);
	app.post("/locations", panelControllers.addLocation);
	app.post("/descriptions", panelControllers.addDescriptions);
	app.post("/adminlogin", function(req, res){
		panelControllers.adminloginPost(req, res);
	});	
};