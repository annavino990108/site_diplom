const express = require('express');
const router = express.Router();
const models = require('../models');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const mkdirp = require('mkdirp');
const config = require('../config/app');

//const rs = () => Math.random().toString(36).slice(-3);

const storage = multer.diskStorage({
  destination:(req,res,cb)=>{
    const user_path = req.session.userId;
    const dir = '/'+ user_path + '/'+ Date.now() + '/' ;
    req.dir = dir;
    mkdirp(config.DESTINATION + dir, err=>cb(err,config.DESTINATION + dir));
  },
  filename:async(req,file,cb)=>{
    const user_id = req.session.userId;
    const filename = Date.now() + path.extname(file.originalname);
    const dir = req.dir;

  await models.File.create({
      user:user_id,
      category:req.body.category,
      path:dir  + filename,

    });

    cb(null,filename);
  }
});

const upload = multer({
  storage,
  limits:{fileSize: 2*1024*1024},
  fileFilter:(req,file,cb)=>{
    const ext = path.extname(file.originalname);
    if(ext !=='.jpg' && ext !=='.png' && ext !=='.jpeg'){
      const err = new Error('Extention')
      err.code = 'EXTENTION';
      return cb(err)
    }
    cb(null, true)
  }
}).single('file');

//upload-image
router.post('/upload',(req,res)=>{
  upload(req, res, err =>{
    let error = '';
    if(err){
    if(err.code === 'LIMIT_FILE_SIZE'){
      error = "Изображение превышает лимит"
    }
    if(err.code === 'EXTENTION'){
      error = 'Неверный формат данных'
    }
  }
  res.json({
    ok:!!error,
  });
});
});

router.delete('/deleteimage/:id',(req,res)=>{
  const id_image = req.params.id;
  models.File.findByIdAndDelete(id_image, function(err){

        if(err) return console.log(err);
      });
});
module.exports = router;
