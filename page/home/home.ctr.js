app.controller('homeController', function($scope, $http, $cookies, $route, $location) {
    
    if ($cookies.get("user")){
        $location.path("/userHome");
    }
    
    
})