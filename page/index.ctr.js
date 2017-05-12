app.controller('MainController', function($scope, $http, $cookies, $route, $location) {
    
    $scope.userName = $cookies.get("user");
    
    
    $scope.path= function(path){
        $location.path(path);
    }
    

    
    $scope.logout= function(){
        $cookies.remove("user");
        $cookies.remove("lastAddUrl");
        $location.path("/");
    }
    
})