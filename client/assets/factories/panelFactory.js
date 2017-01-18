app.factory('panelFactory', ["$http", function($http){
	var factory = {};

	factory.scopeRef = {};

	factory.refreshData = function(){
			for(let table of ["categories", "class_descriptions", "class_instances", "locations"]){
				$http.get("/" + table).then(function(res){
					factory.scopeRef[table] = res.data;
				});
			}
			//factory.scopeRef.$apply();
		};

	factory.addCategory = function(data){
		$http.post("/categories", data).then(function(res){
		// factory.refreshData();
		location.reload();
		});
	};
	factory.getOneStudent= function(){
		$http.post("/get_one_student").then(function(res){
		// factory.refreshData();
		location.reload();
		});
	};

	factory.editCategory = function(data){
		$http.post('/edit_category', data).then(function(res){
		// factory.refreshData();
		location.reload();
		});
	};

	factory.editScheduledClass = function(data){
		$http.post('/edit_scheduled_class', data).then(function(res){
		console.log(data, "edit from factory");
		// factory.refreshData();
		location.reload();
		});
	};		

	factory.addLocation = function(data){
		$http.post("/locations", data).then(function(res){
		// factory.refreshData();
		location.reload();
		});
	};
	factory.editLocation = function(data){
		$http.post("/edit_location", data).then(function(res){
		// factory.refreshData();
		location.reload();
		});
	};
	factory.editClassDescription = function(data){
		$http.post("/edit_class_description", data).then(function(res){
		// factory.refreshData();
		location.reload();
		});
	};

	factory.deleteClassDescription = function(data){
		$http.post('/delete_class_description', data).then(function(res){
		console.log(res);
		factory.refreshData();
		location.reload();
		})
	};

	factory.delete_student = function(data){
		$http.post('/delete_student', data).then(function(res){
		console.log(res);
		// location.reload();
		})
	};

	factory.remove_student = function(data){
		$http.post('/remove_student', data).then(function(res){
		console.log(res);
		// location.reload();
		})
	};


	factory.delete_scheduled_class = function(data){
		$http.post('/delete_scheduled_class', data).then(function(res){
		console.log(res);
		// factory.refreshData();
		location.reload();
		})
	};

	factory.deleteCategory = function(data){
		$http.post('/delete_category', data).then(function(res){
		console.log(res);
		// factory.refreshData();
		location.reload();
		})
	};
	factory.deleteLocation = function(data){
		$http.post('/delete_location', data).then(function(res){
		console.log(res);
		// factory.refreshData();
		location.reload();
		})
	};

	factory.addClassDescription = function(data){
		$http.post("/descriptions", data).then(function(res){
		console.log(res);
		// factory.refreshData();
		location.reload();
		});
	};

	factory.scheduleClass = function(data){
		$http.post("/schedule_class", data).then(function(res){
		console.log(res);
		// factory.refreshData();
		location.reload();
		});
	}

	return factory;
}]);