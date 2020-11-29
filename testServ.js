const fetch = require("node-fetch");



async function f() {
  let res = await fetch("http://localhost:3000/AddFunc", {
    method: "POST",
    headers: {
      "name" : "name",
      "grades" : ["a","1", "b","2"]
    }
  });
  let t = await res.text();
  console.log(t);
  //let xhr = new XMLHttpRequest();
  //xhr.open("POST", "http://localhost:3000/AddFunc", true);
  //xhr.send("name=name");
  //xhr.onreadystatechange = () =>{
  //  console.log(xhr.responseText)
  //}
}

module.exports = {f};