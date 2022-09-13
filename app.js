const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const fs = require("fs");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect(process.env.DB_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log(`MongoDB Connected: ${client.connection.host}`);
  })
  .catch(error => console.error(error));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads")
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

const upload = multer({ storage: storage });
const imgModel = require("./model");

app.get('/', (req, res) => {
  imgModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
      res.status(500).send("An error occured", err);
    }
    else {
      res.render("index", { items: items });
    }
  });
});

app.post('/', upload.single("image"), (req, res, next) => {
  const obj = {
    name: req.body.name,
    desc: req.body.desc,
    img: {
      data: fs.readFileSync(path.join(__dirname + "/uploads/" + req.file.filename)),
      contentType: req.file.mimeType
    }
  };

  imgModel.create(obj, (err, item) => {
    if (err) {
      console.log(err);
    }
    else {
      res.redirect('/');
    }
  });

  fs.unlink(req.file.path, err => {
    if (err) {
      console.log(err);
    }
  });
});

app.listen(PORT, err => {
  if (err) {
    throw err;
  }
  else {
    console.log(`App is running on http://localhost:${PORT}`);
    console.log('Press CTRL-C to stop');
  }
});
