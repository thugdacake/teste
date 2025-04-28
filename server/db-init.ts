import { storage } from "./storage";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";

// Configuração do MySQL
export const dbConfig = {
  host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost',
  user: 'root',
  password: '123123',
  database: 'thuglife',
  port: 3306
};

// Criar pool de conexões
export const pool = mysql.createPool(dbConfig);

export async function initializeDatabase() {
  try {
    // Verificar se o usuário admin já existe
    const adminUser = await storage.getUserByUsername("thuglife");
    
    if (!adminUser) {
      // Criar usuário admin com as credenciais solicitadas
      const hashedPassword = await bcrypt.hash("thuglife", 10);
      
      await storage.createUser({
        username: "thuglife",
        password: hashedPassword,
        role: "admin",
        avatar: "", // Avatar opcional
      });
      
      console.log("Usuário admin criado com sucesso!");
    }
    
    // Configurar estatísticas do servidor
    const serverStats = {
      online: true,
      players: 72,
      maxPlayers: 128,
      lastRestart: new Date().toISOString(),
      ping: 45
    };
    
    // Salvar configurações do servidor
    await storage.upsertSetting({
      key: "server_status",
      value: JSON.stringify(serverStats),
      category: "server"
    });
    
    await storage.upsertSetting({
      key: "server_name",
      value: "Tokyo Edge Roleplay",
      category: "server"
    });
    
    await storage.upsertSetting({
      key: "server_description",
      value: "A cidade que nunca dorme e as oportunidades estão por toda parte!",
      category: "server"
    });
    
    await storage.upsertSetting({
      key: "discord_url",
      value: "https://discord.gg/NZAAaAmQtC",
      category: "social"
    });
    
    await storage.upsertSetting({
      key: "connection_url",
      value: "cfx.re/join/85e4q3",
      category: "server"
    });
    
    console.log("Configurações do servidor inicializadas com sucesso!");
    
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
  }
}