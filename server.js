const express = require("express");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080|| 5000;
const mongoClient = require("mongodb").MongoClient;
const dburl = "mongodb://webapps:webapps@ds157500.mlab.com:57500/webapps";


const server = express()
    .use(express.static(__dirname+"/page"))
    .use(bodyParser.json());
    
  
/* new user - check and insert */    
server.post("/signUp", function(req,res){
    mongoClient.connect(dburl, function(err,db){
        if (err) throw err;
        
        db.collection("userdata").find({}).toArray(function(err,result){
            if (err) throw err;
            
            var check = false;
            for (var i = 0; i<result.length; i++){
                if (req.body.name.toLowerCase() == result[i].user){
                    check = "Name schon in Verwendung";
                    break;
                }
                if (req.body.email.toLowerCase() == result[i].email){
                    check = "Email schon in Verwendung";
                    break;
                }
            }
            
            if (check == false) {
                db.collection("userdata").insert({
                    user: req.body.name.toLowerCase(),
                    email: req.body.email.toLowerCase(),
                    password: req.body.password
                });
                check= true;
            }
        res.send(check);
        db.close();    
        });
    });
});

/* Login */
server.post("/login", function(req,res){
    mongoClient.connect(dburl, function(err,db){
        if (err) throw err;
        
        var check;
        db.collection("userdata").find({"user": req.body.name.toLowerCase()}).toArray(function(err,result){
            if (err) throw err;
            
            if (result.length>0 && result[0].password == req.body.password){
                check = true;
            } else{
                check = "Benutzer oder Passwort falsch";
            }
        res.send(check);
        db.close();
        });
    });
});





server.listen(PORT, () => console.log("roger, we are online...."));