app.controller('MainController', function($scope, $http, $cookies, $route, $location) {
    
    $scope.userName = $cookies.get("user");
    
    $scope.path= function(path){
        $location.path(path);
    }
    
    if ($cookies.get("user")){
        $location.path("/userHome");
    }
    
    $scope.logout= function(){
        $cookies.remove("user");
        $location.path("/");
    }
    
})