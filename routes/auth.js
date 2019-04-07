const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const models = require('../models');
const mailer =require('../config/mailer');

//РЕГИСТРАЦИЯ
router.post('/singin',(req,res)=>{
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const city = req.body.city;
  const role = req.body.role;

  if(!firstName || !lastName || !email || !password || !city || !role){
    const fields = [];
    if(!firstName) fields.push('firstName');
    if(!lastName) fields.push('lastName');
    if(!email) fields.push('email');
    if(!password) fields.push('password');
    if(!city) fields.push('city');
    if(!role) fields.push('role');
    res.json({
      ok:false,
      error:'Все поля должны быть заполнены',
      fields
    });
  }else{

  models.User.findOne({
  email}).then(user=>{
  if(!user){
    const user_secret_token = Math.round((Math.random() * (9999 - 1000) + 1000));
    bcrypt.hash(password, null, null, function(err, hash){
    models.User.create({
        firstName,
        lastName,
        city,
        role,
        email,
        password:hash,
        active:false,
        secret_token:user_secret_token,
      })
      .then(user => {
        console.log(user);
        mailer(user.email, 'Подтверждение регистрации', `Код подтверждения: ${user_secret_token}`);
        res.json({
          ok:true,
        });
      })
      .catch(err => {
        console.log(err);
        res.json({
          ok:false,
          error:'Ошибка, попробуйте позже!',
        });
      });
    });
  }else{
    res.json({
      ok:false,
      error:'Данный email уже используется',
      fields:['email']
    });
  }
});
}
});

//ПОДТВЕРЖДЕНИЕ РЕГИСТРАЦИИ
router.put('/verif',(req,res)=>{
  const secret_token = req.body.secret_token;
  const email = req.body.email;
 models.User.findOne({
    email
  }).then(user=>{
    if(user.secret_token == secret_token){
      const id = user._id;
      models.User.findOneAndUpdate({_id: id}, {active:true}, {new: true}, function(err, user){
          if(err) return console.log(err);
      });
      req.session.userId = user.id;
      req.session.userEmail = user.email;
      res.json({
        ok:true,
      });
    }
  }).catch(err => {
    console.log(err);
    res.json({
      ok:false,
      error:'Ошибка, попробуйте позже!',
    });
});
});
//ВХОД
router.post('/login',(req,res)=>{

  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password){
    const fields = [];

    if(!email) fields.push('email');
    if(!password) fields.push('password');
    res.json({
      ok:false,
      error:'Все поля должны быть заполнены',
      fields
    });
  }else{
    models.User.findOne({
      email
    })
    .then(user=>{
      if(!user){
        res.json({
          ok:false,
          error:'Логин и пароль неверны',
          fields:['email','password']
        });
      }else{
        bcrypt.compare(password,user.password,function(err,result){
          if(!result){
            res.json({
              ok:false,
              error:'Логин и пароль неверны',
              fields:['email','password']
            });
          }else if (user.active == false) {
            res.json({
              ok:false,
              error:'Регистрация не была подтверждена',
            });
          }else{
            req.session.userId = user.id;
            req.session.userEmail = user.email;
            res.json({
              ok:true,
            });
          }
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.json({
        ok:false,
        error:'Ошибка, попробуйте позже!',
      });
    });
  }
});

//ВЫХОД
router.get('/logout',(req,res)=>{
  if(req.session){
    req.session.destroy(() =>
  {
    res.redirect('/');
  });
  }
});
//СБРОС ПАРОЛЯ
function gen_password(){
    var new_password = "";
    var symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!№%?*_";
    for (var i = 0; i < 8; i++){
        new_password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }
    return new_password;
}

router.put('/resertpassword',(req,res)=>{
  const new_password = gen_password();
  const email = req.body.email;
 models.User.findOne({
    email
  }).then(user=>{
      bcrypt.hash(new_password, null, null, function(err, hash){
      models.User.findOneAndUpdate({_id: user._id}, {password:hash}, {new: true}, function(err, user){
          if(err) return console.log(err);
      });
    });
      mailer(user.email, 'Изменение пароля', `Новый пароль: ${new_password}`);
      res.json({
        ok:true,
      });
    }).catch(err => {
      console.log(err);
      res.json({
        ok:false,
        error:'Ошибка, попробуйте позже!',
      });
    });
});

module.exports = router;
