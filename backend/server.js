const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { create } = require("domain");

const app = express();
app.use(express.json());
app.use(cors());

// frontend
app.use(express.static(path.join(__dirname, "../frontend")));

const DB_FILE = path.join(__dirname, "db.json");

function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        return { usuarios: [], pacientes: [], triagens: [], consultas:[] };
    }
    return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Login
app.post("/login", (req, res)=> {
    const db = readDB();
    const user = db.usuarios.find(
        u => u.usuario === req.body.usuario && u.senha === req.body.senha
    );

    if (!user) return res.status(401).json({ erro: "Login inválidos" });

    res.json(user);
});

//Atendimento
app.post("/atendimento", (req, res) => {
    const db = reaDB();

    const paciente = {
        id: Date.now(),
        ...req.boby,
        status: "triagem",
        createdAt: new Date()
    };

    db.pacientes.push(paciente);
    writeDB(db);

    res.json(paciente);
});


// Triagem (com prioridade automática)
app.post("/triagem", (req, res) => {
    const db = readDB();
    
    let risco = req.body.risco;

// regra automática simples
if (req.body.temperatura > 39) risco ="vermelho";
if (req.body.temperatura < 38 && risco !== "vermelho") risco = "amarelo";

const triagem = {
    id: Date.now(),
    ...req.body,
    risco,
    status: "aguardando_medico"
};

db.triagens.push(triagem);
writeDB(db);

res.json(triagem);
});

// 📝 Triagens para médico
app.get("/triagens", (req, res) => {
    const db = readDB();
    res.json(db.triagens);
});

// 🩺 Consulta 
app.post("/consulta", (req, res) => {
   const db = readDB();

   const consulta = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date()
};

 db.consultas.push(consulta);
 writeDB(db);

 res.json(consulta);
});


// 💊MEDICAÇÕES
app.get("/medicacoes", (req, res) => {
    const db = readDB();
    res.json(db.consultas);
});

// 🚀START
app.listen(3000, () => {
    console.log("Hospital Pro rodando em http://localhost:3000");
});
