app.controller("panelController", ["$scope", "$routeParams", "$http", "panelFactory", function($scope, $routeParams, $http, panelFactory){    
    
    if($scope.init === undefined)
    {
        $scope.addCategory = function(){ 
            let data = {category_name: $scope.category_name, category_description: $scope.category_description};
            panelFactory.addCategory(data);
        }

        $scope.editCategory = function(id){
            panelFactory.editCategory({category_name: $scope.edit.category_name, category_description: $scope.edit.category_description, id: id});
        }
        $scope.editLocation = function(id){
            panelFactory.editLocation({location_name: $scope.edit.location_name, location_description: $scope.edit.location_description, id: id});
        }
        $scope.editClassDescription = function(id){
            var toSend = ({class_name: $scope.edit.class_name, class_description: $scope.edit.class_description, category: $scope.edit.class_description_category, id: id});
            panelFactory.editClassDescription(toSend);
            console.log(toSend);
        }
        $scope.editScheduledClass = function(obj, id, index)
        {
            console.log("id:", id);
            console.log("data passed from partial:", obj);
            var class_id = (obj.class)?obj.class.id:undefined;
            var location_id = (obj.location)?obj.location.id:undefined;
            console.log($scope.class_descriptions);
            console.log($scope.locations);
            var data = {
                id:id,
                class_description_id: ((class_id)?class_id:$scope.class_descriptions[index].id),
                location_id: ((location_id)?location_id:$scope.locations[index].id),
                start_date: obj.start_date,
                start_time: obj.start_time,
                end_time: obj.end_time,
                min_students: obj.min_students,
                max_students: obj.max_students
            };
            console.log("data object to pass to factory:", data);
            panelFactory.editScheduledClass(data);
        }
        $scope.addLocation = function(){
            let data = {location_name: $scope.location_name, location_description: $scope.location_description};
            panelFactory.addLocation(data);
            //$scope.locations.push(data);
            //$scope.display.location_names.push($scope.location_name);
        }
        $scope.addClassDescription = function(){
            let data = {class_name: $scope.class_description_name, class_description: $scope.class_description_description, class_category: $scope.class_description_category};
            panelFactory.addClassDescription(data);
            //$scope.class_descriptions.push(data);
            //$scope.display.class_description_names.push($scope.class_description_name);
        }
        $scope.deleteCategory = function(id){
            panelFactory.deleteCategory({id: id});
        }
        $scope.deleteClassDescription = function(id){
            console.log("del class description from fe");
            panelFactory.deleteClassDescription({id: id});
        }
        $scope.deleteScheduledClass = function(id){
            panelFactory.delete_scheduled_class({id:id});
            console.log({id:id});
        }
        $scope.deleteLocation = function(id){
            console.log($scope.locations);
            panelFactory.deleteLocation({id: id});
        }
        $scope.getOneStudent = function(){
            console.log("we are here");
            panelFactory.getOneStudent();
        }
        
        $scope.scheduleClass = function(){
            var data = ({class_descriptions_id: $scope.class_description_id, locations_id: $scope.pick_location_id, start_date: $scope.date, start_time: $scope.start_time, end_time: $scope.end_time, max_students: $scope.max_students, min_students: $scope.min_students});
            panelFactory.scheduleClass(data);
            console.log(scheduled_classes);
        };

        $scope.init = true;
        $scope.categories = [];
        $scope.class_descriptions = [];
        $scope.locations = [];
        $scope.students = [];
        $scope.scheduled_classes = [];
        $scope.class_instances = [];
        $scope.rparam = $routeParams;
        $scope.edit = {};
        panelFactory.scopeRef = $scope;
        panelFactory.refreshData();
    }
}]);