var app = angular.module("app", ["ngRoute"]);

	app.config(function($routeProvider) {
		$routeProvider
		.when("/", {
			templateUrl: "/partials/placeholder.html",
			controller: "panelController"
		})
		.when("/edit_category/:id/", {
				templateUrl: "/partials/edit_category.html",
				controller: "panelController"
			})
		.when("/edit_class_description/:id/", {
				templateUrl: "/partials/edit_class_description.html",
				controller: "panelController"
			})
		.when("/edit_location/:id/", {
				templateUrl: "/partials/edit_location.html",
				controller: "panelController"
			})
		.when("/adminpanel", {
				templateUrl: "adminpanel.html",
				controller: "panelController"
			})
		.when("/edit_scheduled_classes/", {
				templateUrl: "/partials/edit_scheduled_classes.html",
				controller: "panelController"
			})
		.when("/students_list/:id/", {
				templateUrl: "/partials/students_list.html",
				controller: "studentListController"
			})
		.otherwise({
			templateUrl: "noroute.html"
		})
	});




