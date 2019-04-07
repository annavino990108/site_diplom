const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt-nodejs');
const bodyParser = require('body-parser');
const hbs = require("hbs");
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const Schema = mongoose.Schema;
const app = express();
const config = require('./config/app');
const routes = require('./routes');
const models = require('./models');

mongoose.connect(config.connectDB, {
  useNewUrlParser: true,
  useFindAndModify: true,
  useCreateIndex: true
}, function(err){
    if(err) return console.log(err);
    app.listen(config.port, function(){
        console.log("Сервер ожидает подключения...");
    });
});

app.use(
  session({
    secret: config.SESSION_SECRET,
    resave:true,
    saveUninitialized:false,
    store:new MongoStore({
      mongooseConnection:mongoose.connection
    })
  })
);

app.set("view engine", "hbs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/public', express.static('public'));
app.use('/uploads', express.static('uploads'));
hbs.registerPartials(__dirname + "/views/blocks");

app.get("/", function(request, response){
    response.render("home.hbs");
});
app.get("/singin", function(request, response){
     response.render("singin.hbs");
});
app.get("/login", function(request, response){
     response.render("login.hbs");
});
app.get("/acount", function(req, res){
  const id = req.session.userId;
/*  models.User.findOne({
    _id: id
  }).then(user=>{
    res.render("acount.hbs",{
    user
    });
  });*/
  models.File.find({
    user: id
  }).then(file=>{
    res.render("acount.hbs",{
    file
    });
  });
});
app.use('/api',routes.auth);
app.use('/api',routes.user);
