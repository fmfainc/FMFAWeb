app.controller("studentListController", ["$scope", "$routeParams", "$http", "panelFactory", function($scope, $routeParams, $http, panelFactory){
    // $scope.rparam = $routeParams;
    $http.get("/get_students_for_class/" + $routeParams.id).then(function(res){
        $scope.student_list = res.data;
        // console.log(res.data);
    });
    $scope.editStudent = function(obj, index){
    	console.log(obj);
    	let data = {"first_name": obj.first_name,
    				"last_name" : obj.last_name,
    				"email" : obj.email,
    				"phone" : obj.phone,
    				"register_date" : $scope.student_list[index].register_date,
    				"waitlisted" : (obj.waitlisted === undefined)?false:true,
    				"student_id":$scope.student_list[index].id,
    				"class_instance_id" : $scope.student_list[index].class_instance_id
    				}

    	$http.post("/edit_student", data).then(function(res){
		panelFactory.refreshData();
		});
    }

        $scope.delete_student = function(id){
            panelFactory.delete_student({id:id});
        }
}]);

