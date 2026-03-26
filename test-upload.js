fetch("http://localhost:8082/api/upload", { method: "POST" })
  .then(res => res.text().then(text => console.log(res.status, text)))
  .catch(console.error);
