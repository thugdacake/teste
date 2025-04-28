import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import { insertStaffApplicationSchema, insertUserSchema, insertStaffMemberSchema } from "@shared/schema";
import { WebSocketServer, WebSocket } from 'ws';

declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      username: string;
      discordId?: string;
      discordUsername?: string;
      avatar?: string;
      role: string;
    };
  }
}

interface DiscordUser {
  id: string;
  username: string;
  avatar?: string;
  discriminator: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      store: new MemoryStoreSession({
        checkPeriod: 86400000 // 24h
      }),
      secret: process.env.SESSION_SECRET || "tokyo-edge-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        secure: process.env.NODE_ENV === "production"
      }
    })
  );

  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Nome de usuário incorreto" });
        }
        
        if (!user.password) {
          return done(null, false, { message: "Este usuário usa autenticação Discord" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Senha incorreta" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, undefined);
    }
  });

  // Auth Routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    if (req.user) {
      const user = req.user as any;
      req.session.user = {
        id: user.id,
        username: user.username,
        discordId: user.discordId,
        discordUsername: user.discordUsername,
        avatar: user.avatar,
        role: user.role
      };
      res.json({ success: true, user: req.session.user });
    } else {
      res.status(401).json({ success: false, message: "Falha na autenticação" });
    }
  });

  app.get("/api/auth/discord/url", (req, res) => {
    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "your_discord_client_id";
    const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:5000/api/auth/discord/callback";
    const SCOPE = "identify";

    const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${SCOPE}`;
    res.json({ url });
  });

  app.get("/api/auth/discord/callback", async (req, res) => {
    const { code } = req.query;
    
    if (!code || typeof code !== "string") {
      return res.redirect("/#error=invalid_request");
    }
    
    const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "your_discord_client_id";
    const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "your_discord_client_secret";
    const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:5000/api/auth/discord/callback";
    
    try {
      // Exchange code for token
      const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI
        })
      });
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error("Discord token error:", tokenData);
        return res.redirect("/#error=token_error");
      }
      
      // Get user info
      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`
        }
      });
      
      const discordUser = await userResponse.json() as DiscordUser;
      
      // Check if user exists
      let user = await storage.getUserByDiscordId(discordUser.id);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          username: `${discordUser.username}#${discordUser.discriminator}`,
          discordId: discordUser.id,
          discordUsername: `${discordUser.username}#${discordUser.discriminator}`,
          avatar: discordUser.avatar,
          role: "user"
        });
      } else {
        // Update existing user with latest Discord info
        user = await storage.updateUser(user.id, {
          discordUsername: `${discordUser.username}#${discordUser.discriminator}`,
          avatar: discordUser.avatar
        }) || user;
      }
      
      // Set session
      req.session.user = {
        id: user.id,
        username: user.username,
        discordId: user.discordId,
        discordUsername: user.discordUsername,
        avatar: user.avatar,
        role: user.role
      };
      
      // Redirect to application page or home
      return res.redirect(req.query.redirect_to?.toString() || "/");
      
    } catch (error) {
      console.error("Discord auth error:", error);
      return res.redirect("/#error=auth_error");
    }
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ message: "Não autenticado" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ success: false, message: "Erro ao fazer logout" });
      }
      res.json({ success: true });
    });
  });

  // News routes
  app.get("/api/news", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit?.toString() || "10");
      const offset = parseInt(req.query.offset?.toString() || "0");
      const categoryId = req.query.category ? parseInt(req.query.category.toString()) : undefined;
      
      const articles = await storage.getNewsList(limit, offset, categoryId);
      const categories = await storage.getNewsCategories();
      
      // Enrich with category information
      const enrichedArticles = articles.map(article => {
        const category = categories.find(c => c.id === article.categoryId);
        return {
          ...article,
          category: category || null
        };
      });
      
      res.json({ articles: enrichedArticles });
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Erro ao buscar notícias" });
    }
  });

  app.get("/api/news/featured", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit?.toString() || "3");
      
      const articles = await storage.getFeaturedNews(limit);
      const categories = await storage.getNewsCategories();
      
      // Enrich with category information
      const enrichedArticles = articles.map(article => {
        const category = categories.find(c => c.id === article.categoryId);
        return {
          ...article,
          category: category || null
        };
      });
      
      res.json({ articles: enrichedArticles });
    } catch (error) {
      console.error("Error fetching featured news:", error);
      res.status(500).json({ message: "Erro ao buscar notícias em destaque" });
    }
  });

  app.get("/api/news/:slug", async (req, res) => {
    try {
      const article = await storage.getNewsBySlug(req.params.slug);
      
      if (!article) {
        return res.status(404).json({ message: "Notícia não encontrada" });
      }
      
      const category = article.categoryId 
        ? await storage.getNewsCategory(article.categoryId) 
        : null;
        
      const author = article.authorId 
        ? await storage.getUser(article.authorId) 
        : null;
      
      res.json({ 
        article: {
          ...article,
          category,
          author: author ? {
            id: author.id,
            username: author.username,
            avatar: author.avatar
          } : null
        } 
      });
    } catch (error) {
      console.error("Error fetching news article:", error);
      res.status(500).json({ message: "Erro ao buscar notícia" });
    }
  });

  app.get("/api/news/categories", async (req, res) => {
    try {
      const categories = await storage.getNewsCategories();
      res.json({ categories });
    } catch (error) {
      console.error("Error fetching news categories:", error);
      res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });

  // Admin-only routes
  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    
    if (req.session.user.role !== "admin") {
      return res.status(403).json({ message: "Acesso negado" });
    }
    
    next();
  };

  // Admin News Management
  app.post("/api/admin/news", isAdmin, async (req, res) => {
    try {
      const articleData = {
        title: req.body.title,
        slug: req.body.slug,
        content: req.body.content,
        excerpt: req.body.excerpt,
        coverImage: req.body.coverImage,
        authorId: req.session.user!.id,
        categoryId: req.body.categoryId,
        published: req.body.published || true
      };
      
      const article = await storage.createNews(articleData);
      res.json({ article, success: true });
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ message: "Erro ao criar notícia" });
    }
  });

  app.put("/api/admin/news/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const articleData = {
        title: req.body.title,
        slug: req.body.slug,
        content: req.body.content,
        excerpt: req.body.excerpt,
        coverImage: req.body.coverImage,
        categoryId: req.body.categoryId,
        published: req.body.published
      };
      
      const article = await storage.updateNews(id, articleData);
      
      if (!article) {
        return res.status(404).json({ message: "Notícia não encontrada" });
      }
      
      res.json({ article, success: true });
    } catch (error) {
      console.error("Error updating news:", error);
      res.status(500).json({ message: "Erro ao atualizar notícia" });
    }
  });

  app.delete("/api/admin/news/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNews(id);
      
      if (!success) {
        return res.status(404).json({ message: "Notícia não encontrada" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting news:", error);
      res.status(500).json({ message: "Erro ao excluir notícia" });
    }
  });

  // Category Management
  app.post("/api/admin/categories", isAdmin, async (req, res) => {
    try {
      const categoryData = {
        name: req.body.name,
        slug: req.body.slug,
        color: req.body.color
      };
      
      const category = await storage.createNewsCategory(categoryData);
      res.json({ category, success: true });
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Erro ao criar categoria" });
    }
  });

  app.put("/api/admin/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = {
        name: req.body.name,
        slug: req.body.slug,
        color: req.body.color
      };
      
      const category = await storage.updateNewsCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      
      res.json({ category, success: true });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Erro ao atualizar categoria" });
    }
  });

  app.delete("/api/admin/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNewsCategory(id);
      
      if (!success) {
        return res.status(404).json({ message: "Categoria não encontrada" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Erro ao excluir categoria" });
    }
  });

  // Staff Application Routes
  app.post("/api/applications", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      // Validate the application data
      const validatedData = insertStaffApplicationSchema.parse({
        ...req.body,
        userId: req.session.user.id
      });
      
      const application = await storage.createStaffApplication(validatedData);
      res.json({ application, success: true });
    } catch (error) {
      console.error("Error creating application:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de aplicação inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar aplicação" });
    }
  });

  app.get("/api/applications/my", async (req, res) => {
    try {
      if (!req.session.user) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const applications = await storage.getStaffApplicationsByUserId(req.session.user.id);
      res.json({ applications });
    } catch (error) {
      console.error("Error fetching user applications:", error);
      res.status(500).json({ message: "Erro ao buscar aplicações" });
    }
  });

  // Admin Application Management
  app.get("/api/admin/applications", isAdmin, async (req, res) => {
    try {
      const status = req.query.status?.toString();
      const limit = parseInt(req.query.limit?.toString() || "10");
      const offset = parseInt(req.query.offset?.toString() || "0");
      
      const applications = await storage.getStaffApplications(status, limit, offset);
      
      // Enrich with user information
      const enrichedApplications = await Promise.all(applications.map(async app => {
        const user = await storage.getUser(app.userId);
        return {
          ...app,
          user: user ? {
            id: user.id,
            username: user.username,
            discordUsername: user.discordUsername,
            avatar: user.avatar
          } : null
        };
      }));
      
      res.json({ applications: enrichedApplications });
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Erro ao buscar aplicações" });
    }
  });

  app.get("/api/admin/applications/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.getStaffApplication(id);
      
      if (!application) {
        return res.status(404).json({ message: "Aplicação não encontrada" });
      }
      
      const user = await storage.getUser(application.userId);
      
      res.json({ 
        application: {
          ...application,
          user: user ? {
            id: user.id,
            username: user.username,
            discordUsername: user.discordUsername,
            avatar: user.avatar
          } : null
        } 
      });
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Erro ao buscar aplicação" });
    }
  });

  app.put("/api/admin/applications/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const applicationData = {
        status: req.body.status,
        adminNotes: req.body.adminNotes,
        reviewedBy: req.session.user!.id
      };
      
      const application = await storage.updateStaffApplication(id, applicationData);
      
      if (!application) {
        return res.status(404).json({ message: "Aplicação não encontrada" });
      }
      
      res.json({ application, success: true });
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Erro ao atualizar aplicação" });
    }
  });

  // Settings Routes
  app.get("/api/settings/public", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json({ settings });
    } catch (error) {
      console.error("Error fetching public settings:", error);
      res.status(500).json({ message: "Erro ao buscar configurações" });
    }
  });

  app.get("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json({ settings });
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Erro ao buscar configurações" });
    }
  });

  app.put("/api/admin/settings/:key", isAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      const { value, category } = req.body;
      
      if (!value || !category) {
        return res.status(400).json({ message: "Valor e categoria são obrigatórios" });
      }
      
      const setting = await storage.upsertSetting({ key, value, category });
      res.json({ setting, success: true });
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Erro ao atualizar configuração" });
    }
  });

  // Server Status
  app.get("/api/server/status", async (req, res) => {
    try {
      // Mock server status (in a real implementation this would query the FiveM server API)
      res.json({
        online: true,
        players: 72,
        maxPlayers: 128,
        lastRestart: new Date().toISOString(),
        ping: 48
      });
    } catch (error) {
      console.error("Error fetching server status:", error);
      res.status(500).json({ message: "Erro ao buscar status do servidor" });
    }
  });
  
  // Staff Members routes (public)
  app.get("/api/staff", async (req, res) => {
    try {
      const staffMembers = await storage.getStaffMembers(true); // Get only active members
      
      res.json({ staffMembers });
    } catch (error) {
      console.error("Error fetching staff members:", error);
      res.status(500).json({ message: "Erro ao buscar membros da equipe" });
    }
  });
  
  // Staff Members admin routes
  app.get("/api/admin/staff", isAdmin, async (req, res) => {
    try {
      const staffMembers = await storage.getStaffMembers(false); // Get all members including inactive
      
      res.json({ staffMembers });
    } catch (error) {
      console.error("Error fetching staff members:", error);
      res.status(500).json({ message: "Erro ao buscar membros da equipe" });
    }
  });
  
  app.get("/api/admin/staff/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const staffMember = await storage.getStaffMember(id);
      
      if (!staffMember) {
        return res.status(404).json({ message: "Membro da equipe não encontrado" });
      }
      
      res.json({ staffMember });
    } catch (error) {
      console.error("Error fetching staff member:", error);
      res.status(500).json({ message: "Erro ao buscar membro da equipe" });
    }
  });
  
  app.post("/api/admin/staff", isAdmin, async (req, res) => {
    try {
      const staffMemberData = {
        name: req.body.name,
        role: req.body.role,
        position: req.body.position,
        userId: req.body.userId || null,
        avatar: req.body.avatar || null,
        bio: req.body.bio || null,
        joinedAt: req.body.joinedAt ? new Date(req.body.joinedAt) : new Date(),
        displayOrder: req.body.displayOrder || 999,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        socialLinks: req.body.socialLinks || null
      };
      
      const staffMember = await storage.createStaffMember(staffMemberData);
      res.json({ staffMember, success: true });
    } catch (error) {
      console.error("Error creating staff member:", error);
      res.status(500).json({ message: "Erro ao criar membro da equipe" });
    }
  });
  
  app.put("/api/admin/staff/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const staffMemberData = {
        name: req.body.name,
        role: req.body.role,
        position: req.body.position,
        userId: req.body.userId,
        avatar: req.body.avatar,
        bio: req.body.bio,
        displayOrder: req.body.displayOrder,
        isActive: req.body.isActive,
        socialLinks: req.body.socialLinks
      };
      
      const staffMember = await storage.updateStaffMember(id, staffMemberData);
      
      if (!staffMember) {
        return res.status(404).json({ message: "Membro da equipe não encontrado" });
      }
      
      res.json({ staffMember, success: true });
    } catch (error) {
      console.error("Error updating staff member:", error);
      res.status(500).json({ message: "Erro ao atualizar membro da equipe" });
    }
  });
  
  app.delete("/api/admin/staff/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStaffMember(id);
      
      if (!success) {
        return res.status(404).json({ message: "Membro da equipe não encontrado" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting staff member:", error);
      res.status(500).json({ message: "Erro ao excluir membro da equipe" });
    }
  });

  const httpServer = createServer(app);
  
  // Configuração do WebSocket Server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Lista de conexões ativas
  const clients = new Set<WebSocket>();
  
  // Extender o tipo WebSocket para incluir a propriedade isAlive
  interface CustomWebSocket extends WebSocket {
    isAlive: boolean;
  }
  
  // Quando uma conexão é estabelecida
  wss.on('connection', (ws: WebSocket) => {
    console.log('Nova conexão WebSocket estabelecida');
    
    // Marcar como ativo inicialmente
    const customWs = ws as CustomWebSocket;
    customWs.isAlive = true;
    
    // Adicionar cliente à lista
    clients.add(ws);
    
    // Enviar estado inicial do servidor para o cliente
    const serverStats = {
      type: 'server_stats',
      online: true,
      players: 72,
      maxPlayers: 128,
      lastRestart: new Date().toISOString(),
      ping: 45
    };
    
    ws.send(JSON.stringify(serverStats));
    
    // Lidar com mensagens recebidas
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Mensagem WebSocket recebida:', data);
        
        // Responder de acordo com o tipo de mensagem
        if (data.type === 'get_server_stats') {
          const stats = {
            type: 'server_stats',
            online: true,
            players: 72,
            maxPlayers: 128,
            lastRestart: new Date().toISOString(),
            ping: 45
          };
          
          ws.send(JSON.stringify(stats));
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    });
    
    // Quando a conexão é fechada
    ws.on('close', () => {
      console.log('Conexão WebSocket fechada');
      clients.delete(ws);
    });
    
    // Verificar se o cliente ainda está conectado
    ws.on('pong', () => {
      (ws as CustomWebSocket).isAlive = true;
    });
  });
  
  // Ping periódico para manter conexões ativas e eliminar conexões mortas
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const customWs = ws as CustomWebSocket;
      if (customWs.isAlive === false) {
        clients.delete(ws);
        return ws.terminate();
      }
      
      customWs.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  // Limpar intervalo quando o servidor for encerrado
  wss.on('close', () => {
    clearInterval(interval);
  });
  
  // Função para enviar atualização para todos os clientes conectados
  const broadcastUpdate = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };
  
  // Buscar estatísticas do servidor FiveM a cada 30 segundos (com fallback para dados simulados)
  const updateServerStats = async () => {
    try {
      // O endereço deve ser configurado para o seu servidor FiveM real
      const serverIp = process.env.FIVEM_SERVER_IP || "177.54.148.60";
      const serverPort = process.env.FIVEM_SERVER_PORT || "30120";
      
      // Definir timeout para a requisição
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
      
      try {
        // Buscar dados do servidor FiveM
        const response = await fetch(`http://${serverIp}:${serverPort}/info.json`, {
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error('Falha ao obter informações do servidor');
        }
        
        const data = await response.json();
        
        // Buscar quantidade de jogadores online
        const playersResponse = await fetch(`http://${serverIp}:${serverPort}/players.json`, {
          signal: controller.signal
        });
        
        if (!playersResponse.ok) {
          throw new Error('Falha ao obter informações dos jogadores');
        }
        
        const playersData = await playersResponse.json();
        
        // Limpar o timeout pois a requisição foi bem-sucedida
        clearTimeout(timeoutId);
        
        const stats = {
          type: 'server_stats',
          online: true,
          players: playersData.length || 0,
          maxPlayers: data.vars?.sv_maxClients || 128,
          lastRestart: new Date().toISOString(),
          ping: Math.floor(30 + Math.random() * 30) // Ainda simulando ping pois não está disponível pela API
        };
        
        broadcastUpdate(stats);
        return;
      } catch (fetchError) {
        // Se ocorrer um erro na requisição, limpar o timeout e prosseguir para os dados simulados
        clearTimeout(timeoutId);
        console.warn('Não foi possível conectar ao servidor FiveM, usando dados simulados:', fetchError.message);
      }
      
      // Fallback para dados simulados (quando o servidor real está inacessível)
      // Buscar da configuração ou usar valores padrão
      const getSetting = async (key: string, defaultValue: string) => {
        try {
          const setting = await storage.getSetting(key);
          return setting ? setting.value : defaultValue;
        } catch (e) {
          return defaultValue;
        }
      };
      
      const isOnlineSetting = await getSetting('server_online', 'true');
      const playersSetting = await getSetting('server_players', '72');
      const maxPlayersSetting = await getSetting('server_max_players', '128');
      
      const isOnline = isOnlineSetting === 'true';
      const players = parseInt(playersSetting, 10);
      const maxPlayers = parseInt(maxPlayersSetting, 10);
      
      // Adicionar variação aleatória nos jogadores online (se o servidor estiver online)
      const currentPlayers = isOnline ? 
        Math.max(0, Math.min(players + Math.floor(Math.random() * 10) - 5, maxPlayers)) : 
        0;
        
      const stats = {
        type: 'server_stats',
        online: isOnline,
        players: currentPlayers,
        maxPlayers: maxPlayers,
        lastRestart: new Date().toISOString(),
        ping: isOnline ? Math.floor(30 + Math.random() * 30) : 0
      };
      
      broadcastUpdate(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas do servidor:', error);
      
      // Em caso de erro grave, informar que o servidor está offline
      const stats = {
        type: 'server_stats',
        online: false,
        players: 0,
        maxPlayers: 128,
        lastRestart: new Date().toISOString(),
        ping: 0
      };
      
      broadcastUpdate(stats);
    }
  };
  
  // Executar imediatamente e então a cada 30 segundos
  updateServerStats();
  setInterval(updateServerStats, 30000);
  
  return httpServer;
}
