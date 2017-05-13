const express = require("express");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080|| 5000;
const mongoClient = require("mongodb").MongoClient;
const dburl = "mongodb://webapps:webapps@ds157500.mlab.com:57500/webapps";
const bing = require("node-bing-api")({ accKey: "1fc3f4c636b44449be7232e39f24e679" });


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


/* Setting */
server.post("/setting", function(req,res){
    mongoClient.connect(dburl, function(err, db){
        if (err) throw err;
        
        /* Profil Daten abrufen */
        
        if (req.body.profilDaten){
            db.collection("userdata").find({"user": req.body.profilDaten}).toArray(function(err, result){
                if (err) throw err;
                
                var profilDaten = {
                    "fullname": result[0].fullName,
                    "stadt": result[0].stadt,
                    "bundesland": result[0].bundesland
                    
                }
            res.send(profilDaten);    
            })
        }
        
        /* Profil aktualisieren */        
        if (req.body.profil){
            if(req.body.profil.name){
                db.collection("userdata").update(
                {"user" : req.body.profil.user},
                {
                    $set: {
                        "fullName" : req.body.profil.name,
                    }
                }
                );
            }
            if (req.body.profil.stadt){
                db.collection("userdata").update(
                {"user" : req.body.profil.user},
                {
                    $set: {
                        "stadt" : req.body.profil.stadt,
                    }
                }
                );
            }
            if (req.body.profil.bundesland){
                db.collection("userdata").update(
                {"user" : req.body.profil.user},
                {
                    $set: {
                        "bundesland" : req.body.profil.bundesland,
                    }
                }
                );               
            }
        res.send("erfolgreich");
        db.close();
        }
        
        /* Passwort prüfen und ändern */
        if (req.body.password){
            db.collection("userdata").find({"user": req.body.password.user}).toArray(function(err,result){
                if (err) throw err;
                
                if (result[0].password !== req.body.password.old){
                    res.send("Altes Passwort ist falsch");
                }else{
                    db.collection("userdata").update(
                    {"user": req.body.password.user},
                    {
                        $set: {
                            "password": req.body.password.new
                        }
                    }
                    );
                res.send("erfolgreich");    
                }
            db.close();     
            });
        }
    });
});



/* UserHome - Chaos....*/
server.post("/userHome", function(req,res){
    /* Meine Bücher - hinzufügen*/
    if (req.body.suche){
        bing.images(req.body.suche, {
            top: 1,  
            }, function (err,puffer,data){
                    mongoClient.connect(dburl,function(err,db){
                        if (err) throw err;
                        
                        db.collection("userdata").update(
                        {"user" : req.body.user},
                        {
                            $push:{
                                "books" : {name:req.body.suche, url:data.value[0].thumbnailUrl}
                            }
                        }
                        )
                    db.close();    
                    })
                res.send(data.value[0].thumbnailUrl);
            });
    }
    /* gesuchtes Buch wieder entfernen */
    if (req.body.entfernen){
        
        mongoClient.connect(dburl,function(err,db){
            if (err) throw err;

            db.collection("userdata").update(
            {"user": req.body.user},
            {
                $pull:{
                    "books" : {name:req.body.entfernen}
                }
            }
            );
            
        db.close();    
        });
    res.send("good")    
    }
    /* alle eignen Bücher zeigen*/
    if(req.body.show){
        mongoClient.connect(dburl, function(err, db) {
            if (err) throw err;
            
            db.collection("userdata").find({user:req.body.user}).toArray(function(err,result){
                if (err) throw err;
                
                res.send(result[0])    
            });
        db.close();    
        });
    }
    /* Handel Anfrage */
    if (req.body.from){
        mongoClient.connect(dburl, function(err,db){
            if (err) throw err;
            
            
            db.collection("userdata").update(
            {"user": req.body.from},
            {
                $push:{
                    ownTradeRequest: {book: req.body.book, bookUser: req.body.to}
                }
            }
            )
            
            db.collection("userdata").update(
            {"user": req.body.to},
            {
                $push:{
                    otherTradeRequest: {book: req.body.book, from: req.body.from}
                }
            }
            )
            
            db.collection("userdata").find({"user": req.body.from}).toArray(function(err,result){
                if (err) throw err;
                
              res.send(result[0].ownTradeRequest);   
            });
           
        db.close();    
        });
    }
});

/* alle Bücher zeigen */
server.get("/userHome", function(req,res){
    mongoClient.connect(dburl, function(err,db){
        if (err) throw err;
        
        var allBooks = [];
        db.collection("userdata").find({}).toArray(function(err,result){
            if (err) throw err;
            
            result.forEach(function(data){
               if(data.books){
                   for (var i = 0; i<data.books.length;i++){
                       data.books[i].user = data.user;
                       allBooks.push(data.books[i]);
                   }
               }
            });
        res.send(allBooks);            
        db.close();
        });
    });
});

/* Anfragen */
server.post("/anfragen", function(req,res){
   mongoClient.connect(dburl,function(err,db){
        if (err) throw err;
        
        /* Anfragen anzeigen*/
        if (req.body.show){
           db.collection("userdata").find({user:req.body.show}).toArray(function(err,result){
               if (err) throw err;
               
               res.send({"ownRequest": result[0].ownTradeRequest, "otherRequest": result[0].otherTradeRequest});
           });           
        }
        
        /* eigene Anfrage löschen */
        if (req.body.ownAnfrage){
            
            /* beim User */
            db.collection("userdata").update(
            {user: req.body.user},
            {
                $pull:{
                 "ownTradeRequest": {
                     "book": req.body.ownAnfrage.book,
                     "bookUser": req.body.ownAnfrage.bookUser
                 }   
                }
            }
            );
            /* beim Buch besitzer */
            db.collection("userdata").update(
            {user: req.body.ownAnfrage.bookUser},
            {
                $pull:{
                    "otherTradeRequest": {
                        "book": req.body.ownAnfrage.book,
                        "from": req.body.user
                    }
                }
            }
            )
        res.send("done");
        }
        
        /* fremde Anfrage ablehnen */
        if (req.body.otherAnfrage){
         
            /* beim User */
            db.collection("userdata").update(
            {user: req.body.user},
            {
                $pull:{
                    "otherTradeRequest": {
                        "book": req.body.otherAnfrage.book,
                        "from": req.body.otherAnfrage.from
                    }
                }
            }
            );
            
            /* Beim Absender */
            db.collection("userdata").update(
            {user: req.body.otherAnfrage.from},
            {
                $pull:{
                    "ownTradeRequest":{
                        "book": req.body.otherAnfrage.book,
                        "bookUser": req.body.user
                    }
                }
            }
            );
        res.send("done");    
        }
        
        /* fremde Anfrage annehmen - nur Löschung Information übergabe nicht vorhanden*/
        if (req.body.accept){
            
            /* Löschung beim User*/
            db.collection("userdata").update(
            {user: req.body.user},
            {
                $pull:{
                    "otherTradeRequest": {
                        "book": req.body.accept.book,
                        "from": req.body.accept.from
                    }
                }
            }
            );
            
            /* Löschung beim Absender */
            db.collection("userdata").update(
            {user: req.body.accept.from},
            {
                $pull:{
                    "ownTradeRequest":{
                        "book": req.body.accept.book,
                        "bookUser": req.body.user
                    }
                }
            }
            );
            
            // hier könnte die Information weitergabe rein
        res.send("done");    
        }    
    db.close();   
   }); 
});

server.listen(PORT, () => console.log("roger, we are online...."));