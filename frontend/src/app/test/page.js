"use client";

import { useState } from "react";
import api_backend from "@/api/axiosInstance";

export default function ClientsPage() {
  const [result, setResult] = useState("");

  // GET ALL
  async function handleGetAll(e) {
    e.preventDefault();
    const res = await api_backend.get('client/get');
    console.log(res.data);
    setResult(JSON.stringify(res.data, null, 2));
  }

  // GET BY ID
  async function handleGetById(e) {
    e.preventDefault();
    const id = e.target.clientId.value;
    const res = await api_backend.get(`client/getById/${id}`);
    setResult(JSON.stringify(res.data, null, 2));
  }

  // CREATE
  async function handleCreate(e) {
    e.preventDefault();
    const body = {
      name: e.target.name.value,
      type: e.target.type.value,
      desc: e.target.desc.value,
    };
    const res = await api_backend.post('client/create', body);
    setResult(JSON.stringify(res.data, null, 2));
  }

  return (
    <div style={{ fontFamily: "sans-serif", margin: "20px" }}>
      <h1>Test des routes Client</h1>

      {/* GET ALL */}
      <form onSubmit={handleGetAll} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h2>GET /clients</h2>
        <button type="submit">Charger les clients</button>
      </form>

      {/* GET BY ID */}
      <form onSubmit={handleGetById} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h2>GET /clients/:id</h2>
        <label>
          ID:
          <input type="number" name="clientId" required style={{ marginLeft: "5px" }} />
        </label>
        <button type="submit" style={{ marginLeft: "10px" }}>Chercher</button>
      </form>

      {/* CREATE */}
      <form onSubmit={handleCreate} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h2>POST /clients</h2>
        <div>
          <label>Nom: <input type="text" name="name" required /></label>
        </div>
        <div>
          <label>Type: <input type="text" name="type" required /></label>
        </div>
        <div>
          <label>Description: <input type="text" name="desc" /></label>
        </div>
        <button type="submit">Créer</button>
      </form>

      <h2>Résultat</h2>
      <pre style={{ background: "#f4f4f4", padding: "10px" }}>{result}</pre>
    </div>
  );
}
