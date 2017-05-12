app.controller('anfragenController', function($scope, $http, $cookies, $route, $location){
    
    $http.post("/anfragen", {show: $cookies.get("user")}).success(function(res){
        console.log(res)
        if (res){$scope.ownAnfragen = res.ownRequest} else {$scope.ownAnfragen= []}
        if (res){$scope.otherAnfragen = res.otherRequest} else {$scope.otherAnfragen= []}
    });
    
    $scope.AnfrageEntscheidung = function(data){
        data.user = $cookies.get("user");
        $http.post("/anfragen",data).success(function(res){
            console.log(res);
        })
    }
    
})