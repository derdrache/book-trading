var express = require("express");
const PORT = process.env.PORT || 8080|| 5000;

const server = express()
    .use(express.static(__dirname+"/page"))
    .listen(PORT, () => console.log("roger, we are online...."))
    
    