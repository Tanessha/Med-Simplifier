fetch("http://localhost:8082/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: "test", password: "123" })
})
.then(res => res.text().then(text => console.log(res.status, text)))
.catch(err => console.error(err));
