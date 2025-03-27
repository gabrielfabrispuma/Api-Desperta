// Alterações no server.js

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dataFile = "config.json";

const statusFile = "status.json"; // Arquivo para persistir o status dos ESP32
const smtpConfigFile = "smtp_config.json"; // Arquivo para configurações SMTP


// Dados padrão para a configuração
const defaultConfig = {
    startHour: 22,
    startMinute: 0,
    endHour: 5,
    endMinute: 0,
    interval: 20,
    email1: "gabrielmarcal95@hotmail.com"
};

// Dados padrão para a configuração SMTP
const defaultSmtpConfig = {
    smtpHost: "email-ssl.com.br",
    smtpPort: 465,
    authorEmail: "ti@fabrispuma.com.br",
    authorPassword: "teste"
};


// Carrega os dados do arquivo de configuração ou usa os padrões
function loadConfig() {
    if (fs.existsSync(dataFile)) {
        return JSON.parse(fs.readFileSync(dataFile, "utf8"));
    } else {
        saveConfig(defaultConfig);
        return defaultConfig;
    }
}

// Salva os dados de configuração no arquivo
function saveConfig(config) {
    fs.writeFileSync(dataFile, JSON.stringify(config, null, 2), "utf8");
}

// Carrega os dados de status do ESP32 do arquivo ou retorna um objeto vazio
function loadStatus() {
    if (fs.existsSync(statusFile)) {
        return JSON.parse(fs.readFileSync(statusFile, "utf8"));
    } else {
        return {}; // Retorna um objeto vazio se o arquivo não existir
    }
}

// Salva os dados de status do ESP32 no arquivo
function saveStatus(status) {
    fs.writeFileSync(statusFile, JSON.stringify(status, null, 2), "utf8");
}

// Carrega a configuração SMTP do arquivo ou usa a padrão
function loadSmtpConfig() {
    if (fs.existsSync(smtpConfigFile)) {
        return JSON.parse(fs.readFileSync(smtpConfigFile, "utf8"));
    } else {
        saveSmtpConfig(defaultSmtpConfig);
        return defaultSmtpConfig;
    }
}

// Salva a configuração SMTP no arquivo
function saveSmtpConfig(config) {
    fs.writeFileSync(smtpConfigFile, JSON.stringify(config, null, 2), "utf8");
}

// Rota para receber o heartbeat do ESP32
app.post("/heartbeat", (req, res) => {
    const { deviceId, status, ipAddress, timestamp } = req.body;

    if (!deviceId || !status || !ipAddress || !timestamp) {
        return res.status(400).send('Dados incompletos no heartbeat.');
    }

    const currentStatus = loadStatus();
    currentStatus[deviceId] = {
        status: status,
        ipAddress: ipAddress,
        timestamp: timestamp
    };

    saveStatus(currentStatus); // Salva o status no arquivo
    console.log(`Heartbeat recebido de ${deviceId}: Status=${status}, IP=${ipAddress}, Timestamp=${timestamp}`);
    res.sendStatus(200);
});

// Rota para obter os dados de configuração, status do ESP32 e configuração SMTP
app.get("/config", (req, res) => {
    const config = loadConfig();
    const status = loadStatus();  // Carrega o status dos ESP32s
    const smtpConfig = loadSmtpConfig(); // Carrega a configuração SMTP

    // Para simplificar, vamos pegar o status do primeiro dispositivo encontrado
    const deviceId = "Desperta_Porteiro_01"; // ID do dispositivo que você está usando
    const esp32Status = status[deviceId] || { status: 'offline', ipAddress: 'N/A', timestamp: null };

    const response = {
        ...config,
        esp32Status: esp32Status,  // Adiciona o status do ESP32 à resposta
        smtpConfig: smtpConfig // Adiciona a configuração SMTP à resposta

    };
    res.json(response);
});

// Rota para atualizar os dados de configuração
app.post("/config", (req, res) => {
    const newConfig = req.body;
    saveConfig(newConfig);
    res.json({ message: "Configuração atualizada!", data: newConfig });
});

// Rota para obter a configuração SMTP
app.get("/smtp-config", (req, res) => {
    const smtpConfig = loadSmtpConfig();
    res.json(smtpConfig);
});

// Rota para atualizar a configuração SMTP
app.post("/smtp-config", (req, res) => {

    const newSmtpConfig = req.body;
    saveSmtpConfig(newSmtpConfig);
    res.json({ message: "Configuração SMTP atualizada!", data: newSmtpConfig });
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
