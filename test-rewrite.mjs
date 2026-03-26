const text = "Asthma is a heterogeneous, chronic inflammatory disorder of the airways characterized by bronchial hyperresponsiveness (BHR), reversible expiratory airflow obstruction, and underlying structural changes known as airway remodeling.";

fetch("http://localhost:8082/api/rewrite", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text, targetLevel: "basic" })
})
  .then(r => r.json())
  .then(d => {
    console.log("\n=== BASIC LEVEL OUTPUT ===");
    console.log(d.rewritten);
  })

fetch("http://localhost:8082/api/rewrite", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text, targetLevel: "intermediate" })
})
  .then(r => r.json())
  .then(d => {
    console.log("\n=== INTERMEDIATE LEVEL OUTPUT ===");
    console.log(d.rewritten);
  });
