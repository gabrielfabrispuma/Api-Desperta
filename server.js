const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dataFile = "config.json";

// Dados padrão
const defaultConfig = {
  startHour: 7,
  startMinute: 0,
  endHour: 17,
  endMinute: 30,
  interval: 15,
  email1: "gabrielmarcal95@hotmail.com"
};

// Carrega os dados do arquivo ou usa os padrões
function loadConfig() {
  if (fs.existsSync(dataFile)) {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } else {
    saveConfig(defaultConfig);
    return defaultConfig;
  }
}

// Salva os dados no arquivo
function saveConfig(config) {
  fs.writeFileSync(dataFile, JSON.stringify(config, null, 2), "utf8");
}

// Rota para obter os dados
app.get("/config", (req, res) => {
  res.json(loadConfig());
});

// Rota para atualizar os dados
app.post("/config", (req, res) => {
  const newConfig = req.body;
  saveConfig(newConfig);
  res.json({ message: "Configuração atualizada!", data: newConfig });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});