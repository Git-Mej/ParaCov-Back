const express = require("express");
const app = express();
const fetch = require("cross-fetch");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const PORT = 4000;
const bodyParser = require("body-parser");
const cors = require("cors")
var cron = require("node-cron");


app.use(cors());

app.use(bodyParser.json());
//connection au port 4000
app.listen(PORT, () => console.log(`Health Covid listening on port ${PORT}!`));

//connection à MongoDB
mongoose
  .connect("mongodb://localhost:27017/CovidApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`connection DB réussie`));

//Modèle base de données
const postCovidSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  region: { type: String },
  nouveau_reanimation: { type: Number },
  nouveau_admis: { type: Number },
  nom_departement: { type: String },
  hopital_conv: { type: String },
  nouveau_morts: { type: Number },
  geo_x: { type: Number },
  geo_y: { type: Number },
  hospitalise: { type: Number },
  reanimation: { type: Number },
  sortie_hopital: { type: Number },
  code_departement: { type: String },
  morts: { type: Number },
  date: { type: Date },
  sortie_hopital_jour: { type: Number },
  timestamp: { type: String },
});

const Post = mongoose.model("november-covidpost", postCovidSchema);

const myfunction = async () => {
  const response = await fetch(
    "https://data.opendatasoft.com/api/records/1.0/search/?dataset=donnees-hospitalieres-covid-19-dep-france%40public&q=&rows=248&sort=-date&facet=date&facet=countrycode_iso_3166_1_alpha3&facet=region_min&facet=nom_dep_min&facet=sex&refine.date=2021%2F11&refine.region_min=%C3%8Ele-de-France&refine.sex=Tous"
  );
  const data = await response.json(); //extract JSON from the http response

  //console.log(data);

  var list = [];
  for (i = 0; i < data.records.length; i++) {
    var params = new Post({
      id: data.records[i].recordid,
      region: data.records[i].fields.reg_code,
      nouveau_reanimation: data.records[i].fields.day_intcare_new,
      nouveau_admis: data.records[i].fields.day_hosp_new,
      nom_departement: data.records[i].fields.nom_dep_min,
      hopital_conv: data.records[i].fields.hospconv,
      nouveau_morts: data.records[i].fields.day_death_new,
      geo_x: data.records[i].fields.geo_point_2d[0],
      geo_y: data.records[i].fields.geo_point_2d[1],
      hospitalise: data.records[i].fields.day_hosp,
      reanimation: data.records[i].fields.day_intcare,
      sortie_hopital: data.records[i].fields.tot_out,
      code_departement: data.records[i].fields.dep_code,
      morts: data.records[i].fields.tot_death,
      date: data.records[i].fields.date,
      sortie_hopital_jour: data.records[i].fields.day_out_new,
      timestamp: data.records[i].record_timestamp,
    });
    list.push(params);
    
    var error_result = false;
    // if ( params.find)
    const cccc = await params.save((error) => {
      if (error) {
        error_result = true;
      }
    });
  }

  return error_result;
};


app.get("/", function (req, res) {
  res.send("Bienvenue sur la plateforme ParaCov");
});


//methods GET
app.get("/api", function (req, res) {
  res.send("Welcome to the basic API Rest !");
});

app.get("/api/posts", function (req, res) {
  Post.find({}, (error, posts) => {
    if (error) {
      res.status(400).error(error);
      return;
    }
    res.status(200).send({
      response: posts,
    });
  });
});

app.get("/api/post/:id", function (req, res) {
  const id = req.params.id;
  Post.findById(id, (error, post) => {
    if (error || !post) {
      res.status(400).send({
        error: true,
        message: "Post not found",
      });
    } else {
      res.status(200).send({
        response: post,
      });
    }
  });
});

app.post("/api/add", function (req, res) {
  
  var newPost = myfunction().then();
  //const newPost = Post(body);
  if (newPost) {
    res.status(200).send("post successfully added");
  } else {
    res.status(400).send("error");
  }
});

cron.schedule('0 21 * * *', () => {
  var newPost = myfunction().then();
  console.log("test");
  if (newPost) {
    res.status(200).send("post successfully added");
  } else {
    res.status(400).send("error");
  }
});
