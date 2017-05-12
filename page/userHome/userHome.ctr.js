app.controller('userHomeController', function($scope, $http, $cookies, $route, $location){
    
    var user = $cookies.get("user");
    
    $scope.myBooks = true;
    $scope.allBooks = false;
    $scope.buchSuche = false;
    $scope.allMyBooks= [];
    $scope.neuesBuchUrl = $cookies.get("lastAddUrl");
    if ($cookies.get("lastAddUrl")){$scope.buchSuche = true; $scope.lastAddName = $cookies.get("lastAddName")} else{$scope.buchSuche= false}
   
    $http.post("/userHome",{show: true,user:user}).success(function(res){
        if (res.ownTradeRequest){$scope.myRequest = res.ownTradeRequest.length;} 
        if (res.otherTradeRequest){$scope.otherRequest = res.otherTradeRequest.length;}
        $scope.allMyBooks = res.books;
    });
    
    $http.get("/userHome").success(function(res){
        $scope.allBooksShow = res;
    });
    
    $scope.usersBooks = function(user){
        if (user == $cookies.get("user")){return false} else {return true}
    }
    
    $scope.myBooksOpen= function(){
        $scope.allBooks = false;
        $scope.myBooks= true;
    };
    
    $scope.allBooksOpen = function(){
        $scope.myBooks = false;
        $scope.allBooks = true;
    };
    
    $scope.newBookAdd = function(bookName, event){
        if (!event || event.key =="Enter"){
            $http.post("/userHome",{suche:bookName, user:user}).success(function(res){
                $cookies.put("lastAddUrl", res)
                $cookies.put("lastAddName", bookName)
                $route.reload();
            });
        }
    };
    
    $scope.bookSearchDelete = function(book){
        $scope.buchSuche= false;
        $http.post("/userHome", {entfernen: book,user:user}).success(function(res){
            $cookies.remove("lastAddUrl")
            $route.reload();
        })
    }; 
    
    $scope.tradeRequest = function(userBook,bookName){
        var tradeRequest = {
            from: $cookies.get("user"),
            to: userBook,
            book: bookName
        };
        
        $http.post("/userHome", tradeRequest).success(function(res){
            console.log(res)
        });
    };
    
})