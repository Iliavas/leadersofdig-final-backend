function addCategory(catName, db) {
  db.collection("category").insertOne({"name": catName});
}

function addExecutable(exeParam, db){
  exeParam.categories.sort();
  exeParam.functions.sort();
  grades = [];
  for (i = 0; i < exeParam.categories.length; ++i) {grades.push(0);}
  db.collection("executable").insertOne({...exeParam, grades:grades, feedbacks: []});
}

function AddFunc(db, funcName){
  db.collection("functions").insertOne({"name":funcName});
}

async function SortedAppRet(categories, functions, name, db){
  ret = [];
  await GetByCat(categories, functions, name, db).then((e) => {
    //console.log(e[0].feedbacks);
    ee = e;
    ee.sort((a, b) => {
      myarr = a.feedbacks.map((e) => {return e.average[0]});
      sum = 0;
      for (let i of myarr) sum+=i;
      resa = sum/a.feedbacks.length;


      myarr = b.feedbacks.map((e) => {return e.average[0]});
      sum = 0;
      for (let i of myarr) sum+=i;
      resb = sum/b.feedbacks.length;
      console.log(resa, resb);
      return -resa + resb;
    });
    ret = ee;
  })
  return ret;
}

function GetByCat(categories, functions, name, db){
  console.log(name, functions, categories);
  let par = {
    name: {$regex: name.trim()}
  }
  if (categories.length) par["categories"] = {$in: categories}
  if (functions.length) par["functions"] = {$in : functions}
  console.log(par, "par");
  return db.collection("executable").find(par).toArray();
}

function GetAllCat(db){
  return db.collection("category").find({}).toArray();
}

function GetAllFunc(db){
  return db.collection("functions").find({}).toArray();
}

async function updateGrade(nameExe, grades, db){
  grades = Array.from(grades).reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});
  console.log(grades);
  gradesToPush = [];
  currVal = await db.collection("executable").findOne({"name": nameExe});
  console.log(currVal, grades);
  currVal = currVal.grades;
  i = 0;
  for (key of Object.keys(grades).sort()){
    console.log(grades[key], grades[key]+currVal[i]);
    gradesToPush.push(parseInt(grades[key]) + currVal[i]);
    i++;
  }
  db.collection("executable").updateOne({name:nameExe}, {$set: {"grades": gradesToPush}, $inc: {"usersMod": 1}}, {upset: true});
}

async function checkUser(mac) {
  res = false;
  await db.collection("users").find({email:mac}).toArray().then((e) => {res = e.length});
  return res;
}

async function authUser(email, pass) {
  checkReg = await checkUser(email);
  if (checkReg) return;
  db.collection("users").insertOne({email:email, password:pass, apps: 0});
}

async function getUser(email) {
  console.log(email);
  db.collection("users").find({email: email}).toArray().then((e) => {console.log(e)});
  res = {}
  f = false;
  await checkUser(email).then((e) => {f = e; console.log(e);})
  if (!f) return {"password": "+"};
  await db.collection("users").findOne({email: email}).then((e) => {res = e});
  return res;
}

function getFeedback(email, massages, appName){
  db.collection("executable").updateOne({name: appName}, {"$push": {"feedbacks": {$each: [massages]}}, $inc: {"userMod": 1}})
}

module.exports = {
  GetAllCat, GetAllFunc, SortedAppRet, AddFunc, addExecutable, addCategory, updateGrade, authUser, checkUser, getUser, getFeedback
}