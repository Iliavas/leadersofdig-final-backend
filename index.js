const server = require("express");

app = server();
const cors = require("cors");
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

const client = require('mongodb').MongoClient;
const f = require("./testServ");
const mongoclient = new client("mongodb+srv://dbIlia:Ilvas2006@cluster0.tqkum.mongodb.net/<dbname>?retryWrites=true&w=majority", {useUnifiedTopology: true});

const dbFuncs = require('./functions');

const bodyParser = require('body-parser');
const { authUser } = require("./functions");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"],
    optionsSuccessStatus: 200
  })
);

mongoclient.connect((e, client) => {
  db = client.db("mydb");
  app.get("/getCategories", (req, res) => {
    dbFuncs.GetAllCat(db).then((e) => {res.send(e)});
  });
  app.get("/getAllFunc", (req, res) => {
    dbFuncs.GetAllFunc(db).then((e) => {res.send(e)});
  });
  app.post("/AddFunc", (req, res) => {
    console.log(req.headers);
    dbFuncs.AddFunc(db, req.headers.name);
  });
  app.post("/AddExecutable", (req, res, body) => {
    console.log(req, "fuck");
    dbFuncs.addExecutable({name: req.body.name, categories: req.body.categories, functions: req.body.functions,
    description: req.body.description}, db)
  });
  app.post("/SortedAppRet", (req, res) => {
    console.log(req.body);
    dbFuncs.SortedAppRet(req.body.categories, req.body.functions, req.body.name, db).then((e) => {res.send(e);})
  });
  app.post("/UpdateGrade", (req, res) => {
    data = new Map();
    console.log(req.headers);
    for (i = 0; i < req.headers.grades.split(",").length; i+=2){
      let a = req.headers.grades.split(",")[i];
      data.set(req.headers.grades.split(",")[i], req.headers.grades.split(",")[i+1])
    }
    dbFuncs.updateGrade(req.headers.name, data, db);
  });

  app.post("/userAuth", (req, res) => {
    console.log(req.body);
    dbFuncs.authUser(req.body.email, req.body.pass);
  })

  app.post("/isUserAuth", (req, res) => {
    dbFuncs.checkUser(req.body.email).then((e) => {res.send(e.toString());});
  })
  app.post("/getUser", (req, res) => {
    dbFuncs.getUser(req.body.email).then((e) => {res.send(e)});
  })

  //dbFuncs.addExecutable({"name": "myname1.exe", "functions": ["1", "2"], "categories": ["1", "2"], "userMod": 1, feedbacks: []}, db)
  //dbFuncs.getFeedback("il.vsl0110@gmail.com", {
  //  "interface": [5, "shit"],
  //  "actuality": [3, "fuck"],
  //  "comfortable": [4, "oh my"],
  //  "suitability": [2, "eee"],
  //  "average": [5, "oh my"]
  //},
  //"myname1.exe");
  dbFuncs.SortedAppRet([], [], "", db).then((e) => {console.log(e);});
  app.get("/", (req, res) => {res.send('{"fuck": "1"}');})
  app.listen(7000);
})

