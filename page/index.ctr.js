app.controller('MainController', function($scope, $http, $cookies, $route, $location) {
    
    $scope.path= function(path){
        $location.path(path);
    }
    
    
})