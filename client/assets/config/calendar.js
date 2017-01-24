function popUpSubmit()
{
  var data = {
        first_name: document.forms["popUpForm"]["first_name"].value,
        last_name: document.forms["popUpForm"]["last_name"].value,
        email: document.forms["popUpForm"]["email"].value,
        phone: document.forms["popUpForm"]["phone"].value,
        class_name : global_class_name,
        class_start : global_class_start,
        class_instance_id: global_class_instance_id
      };
      document.getElementById("signUpForm").style.display = "none";
      document.getElementById("signedUpText").style.display = "block";
  globalScopeRef.formSubmit(data);
}

function close_popup(){
  document.getElementById("signUpPopUp").style.visibility = "hidden"
}

var globalScopeRef;

var global_class_name;
var global_class_start;
var global_class_instance_id;
var global_student_id;


var app = angular.module("myApp", ["ngRoute"]);
 // make a facotry to show the courses from the data bae 
 // students to sign up 


// routes
app.config(function($routeProvider){
   $routeProvider
   
      .when("/course", {
         templateUrl: "/partials/course.html"
      })
      .otherwise({
         redirectTo:"/course"
      });
})
 //*****calendarFactory*****

app.factory("calendarFactory",["$http", function($http){
  var factory = {};

  factory.formSubmit = function(data)
  {
    $http.post("/sign_up", data).then(function(res){
      console.log(res);
    });
  }

  factory.getCalendar = function()
  {
    $http.get("/calendar_data").then(function(res){
      for(let instance of res.data)
      {
        instance.am_pm = "am";
        if(instance.date_hour >= 12)
        {
          instance.date_hour %= 12;
          if (instance.date_hour === 0){
            instance.date_hour = 12;
          }
          instance.am_pm = "pm";
        }
        if(instance.date_minute < 10)
        {
          instance.date_minute = "0" + instance.date_minute;
        }
      }

      factory.scopeRef.calendarData = res.data;
    
      $http.get("/get_class_student_count").then(function(res){
        let studentCounts = res.data;
        console.log(studentCounts);
          for(let instance of factory.scopeRef.calendarData)
          {
            if(!instance.seats){
              console.log(instance.max_students, "max students for " + instance.class_name);
              instance.seats = 0 + "/" + instance.max_students;
              instance.signUpButtonText = "sign-up";
            }

            for(let count of studentCounts)
            {
              console.log(count, "count");
              if(instance.class_instance_id === count.class_instance_id)
              {
                console.log("this one", instance);
                instance.seats = count["count(*)"] + "/" + instance.max_students;
                console.log(count["count(*)"], instance.max_students);
                if(count["count(*)"] >= instance.max_students){
                  instance.signUpButtonText = "join waitlist";
                }
              }
            }
          }
      });

      $http.get("/get_class_waitlist_count").then(function(res){
        let waitlistCounts = res.data;
        for(let count of waitlistCounts)
        {
          console.log(count);
          for(let instance of factory.scopeRef.calendarData)
          {
            if(instance.class_instance_id === count.class_instance_id){
              console.log("this one", instance);
              instance.waitlist = (count["count(*)"] > 0)?(count["count(*)"] + " student(s) on waitlist"):undefined;
            }
          }
        }
      });
    });
  }

  return factory;
}]);
 
 //***** Calendar Controller *****
app.controller("CalendarController",['$scope', 'calendarFactory', function($scope, calendarFactory){
  if($scope.init === undefined)
  {
    globalScopeRef = $scope;

    $scope.init = true;

    $scope.formSubmit = function(data){
      calendarFactory.formSubmit(data);
    };

    $scope.signUp = function(index){
      var popUp = document.getElementById("signUpPopUp");
      var className = document.getElementById("popUpClassName");
      var classTime = document.getElementById("popUpClassTime");
      className.innerText = $scope.calendarData[index].class_name;
      classTime.innerText = $scope.calendarData[index].date_month + "/" + $scope.calendarData[index].date_day + "/" + $scope.calendarData[index].date_year + "-" + $scope.calendarData[index].date_hour + ":" + $scope.calendarData[index].date_minute + " " + $scope.calendarData[index].am_pm;
      popUp.style.visibility = "visible";
      document.getElementById("signUpForm").style.display = "block";
      document.getElementById("signedUpText").style.display = "none";

      console.log(index);
      console.log(document.getElementById("signUpPopUp"));
      global_class_name = $scope.calendarData[index].class_name;
      global_class_start = $scope.calendarData[index].date_month + "/" + $scope.calendarData[index].date_day + "/" + $scope.calendarData[index].date_year + "-" + $scope.calendarData[index].date_hour + ":" + $scope.calendarData[index].date_minute + " " + $scope.calendarData[index].am_pm;
      global_class_instance_id = $scope.calendarData[index].class_instance_id;
    };

    calendarFactory.scopeRef = $scope;

    calendarFactory.getCalendar();
    // setTimeout(function(){console.log($scope.calendarData)}, 2000);
  }
}])



