app.controller('settingController', function($scope, $http, $cookies, $route, $location) {
    
    $scope.profilUpdate = function(profilDaten, event){
        if (!event|| event.key =="Enter"){
            profilDaten.user = $cookies.get("user");
            $http.post("/setting", {profil: profilDaten}).success(function(res){
                $scope.profilChange=res;
            });
        }
    };
    
    $scope.passwordChange = function(password, event){
       
        if (!event || event.key =="Enter"){

            $scope.errorMessage = "";        
           if (!password){$scope.errorMessage="Nichts eingetragen"}
           else if (!password.old) {$scope.errorMessage ="altes Passwort eingeben"}
           else if (!password.new) {$scope.errorMessage ="neues Password eingeben"}
           else if (!password.newAgain) {$scope.errorMessage ="neues Password wiederholen"}
           else if (password.new !== password.newAgain){$scope.errorMessage="Wiederholung stimmt nicht überein"}
           else{
               password.user = $cookies.get("user");
               $http.post("/setting", {"password": password}).success(function(res){
                   $scope.errorMessage= res;
               });
           }
  
           
            
        }
    };
    
    
})