import { 
  User, InsertUser, users,
  News, InsertNews, news,
  NewsCategory, InsertNewsCategory, newsCategories,
  StaffApplication, InsertStaffApplication, staffApplications,
  Setting, InsertSetting, settings,
  StaffMember, InsertStaffMember, staffMembers
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // News
  getNews(id: number): Promise<News | undefined>;
  getNewsBySlug(slug: string): Promise<News | undefined>;
  getNewsList(limit?: number, offset?: number, categoryId?: number): Promise<News[]>;
  getFeaturedNews(limit?: number): Promise<News[]>;
  createNews(article: InsertNews): Promise<News>;
  updateNews(id: number, data: Partial<InsertNews>): Promise<News | undefined>;
  deleteNews(id: number): Promise<boolean>;
  
  // News Categories
  getNewsCategory(id: number): Promise<NewsCategory | undefined>;
  getNewsCategoryBySlug(slug: string): Promise<NewsCategory | undefined>;
  getNewsCategories(): Promise<NewsCategory[]>;
  createNewsCategory(category: InsertNewsCategory): Promise<NewsCategory>;
  updateNewsCategory(id: number, data: Partial<InsertNewsCategory>): Promise<NewsCategory | undefined>;
  deleteNewsCategory(id: number): Promise<boolean>;
  
  // Staff Applications
  getStaffApplication(id: number): Promise<StaffApplication | undefined>;
  getStaffApplicationsByUserId(userId: number): Promise<StaffApplication[]>;
  getStaffApplications(status?: string, limit?: number, offset?: number): Promise<StaffApplication[]>;
  createStaffApplication(application: InsertStaffApplication): Promise<StaffApplication>;
  updateStaffApplication(id: number, data: Partial<StaffApplication>): Promise<StaffApplication | undefined>;
  
  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  getSettingsByCategory(category: string): Promise<Setting[]>;
  getAllSettings(): Promise<Setting[]>;
  upsertSetting(data: InsertSetting): Promise<Setting>;
  
  // Staff Members
  getStaffMember(id: number): Promise<StaffMember | undefined>;
  getStaffMemberByUserId(userId: number): Promise<StaffMember | undefined>;
  getStaffMembers(activeOnly?: boolean): Promise<StaffMember[]>;
  createStaffMember(member: InsertStaffMember): Promise<StaffMember>;
  updateStaffMember(id: number, data: Partial<InsertStaffMember>): Promise<StaffMember | undefined>;
  deleteStaffMember(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private newsList: Map<number, News>;
  private newsCategories: Map<number, NewsCategory>;
  private staffApplications: Map<number, StaffApplication>;
  private settings: Map<string, Setting>;
  private staffMembers: Map<number, StaffMember>;
  
  private userIdCounter: number;
  private newsIdCounter: number;
  private newsCategoryIdCounter: number;
  private staffApplicationIdCounter: number;
  private settingIdCounter: number;
  private staffMemberIdCounter: number;

  constructor() {
    this.users = new Map();
    this.newsList = new Map();
    this.newsCategories = new Map();
    this.staffApplications = new Map();
    this.settings = new Map();
    this.staffMembers = new Map();
    
    this.userIdCounter = 1;
    this.newsIdCounter = 1;
    this.newsCategoryIdCounter = 1;
    this.staffApplicationIdCounter = 1;
    this.settingIdCounter = 1;
    this.staffMemberIdCounter = 1;
    
    // Add some initial data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default admin user
    const adminUser = this.createUser({
      username: "admin",
      password: "$2b$10$NRw7K2ZbEPDBxtEKBlOoB.TCrvRVaIQH/hFiF5CbVbRWfKMcI0MEi", // "admin123"
      role: "admin"
    });
    
    // Create default news categories
    const categories = [
      { name: "Atualização", slug: "atualizacao", color: "#00E5FF" },
      { name: "Evento", slug: "evento", color: "#a855f7" },
      { name: "Mecânica", slug: "mecanica", color: "#FF0A54" },
      { name: "Comunidade", slug: "comunidade", color: "#10B981" }
    ];
    
    categories.forEach(cat => this.createNewsCategory(cat));
    
    // Add default settings
    const defaultSettings = [
      { key: "server_name", value: "Tokyo Edge Roleplay", category: "server" },
      { key: "server_description", value: "O servidor de GTA V mais imersivo com foco em roleplay brasileiro urbano", category: "server" },
      { key: "server_connection_url", value: "cfx.re/join/85e4q3", category: "server" },
      { key: "discord_invite_url", value: "https://discord.gg/NZAAaAmQtC", category: "discord" }
    ];
    
    defaultSettings.forEach(setting => this.upsertSetting(setting));
    
    // Add default staff members
    const staffMembers = [
      {
        name: "ThugLife",
        role: "owner",
        position: "Fundador",
        userId: adminUser.id,
        avatar: "https://i.imgur.com/yQGJByM.png",
        bio: "Fundador do servidor Tokyo Edge Roleplay. Responsável por toda a administração e gerenciamento de equipe.",
        joinedAt: new Date("2023-01-01"),
        displayOrder: 1,
        isActive: true,
        socialLinks: {
          discord: "thuglife",
          twitter: "thuglifefivem",
          instagram: "thuglifefivem"
        }
      },
      {
        name: "KyotoAdmin",
        role: "admin",
        position: "Administrador",
        avatar: "https://i.imgur.com/QP8Z4nL.png",
        bio: "Administrador geral, responsável por moderação e gestão de eventos.",
        joinedAt: new Date("2023-02-15"),
        displayOrder: 2,
        isActive: true,
        socialLinks: {
          discord: "kyotoadmin",
        }
      },
      {
        name: "NeoModerator",
        role: "moderador",
        position: "Moderador",
        avatar: "https://i.imgur.com/LU3Pfyr.png",
        bio: "Moderador de chat e servidor. Supervisiona o cumprimento das regras.",
        joinedAt: new Date("2023-03-10"),
        displayOrder: 3,
        isActive: true,
        socialLinks: {
          discord: "neomod",
          twitch: "neomoderator"
        }
      },
      {
        name: "CyberDev",
        role: "desenvolvedor",
        position: "Desenvolvedor",
        avatar: "https://i.imgur.com/KvJ4St1.png",
        bio: "Desenvolvedor principal, responsável pelos sistemas do servidor e website.",
        joinedAt: new Date("2023-04-05"),
        displayOrder: 4,
        isActive: true,
        socialLinks: {
          discord: "cyberdev",
          twitter: "cyberdev_fivem"
        }
      },
      {
        name: "EdgeBuilder",
        role: "construtor",
        position: "Construtor",
        avatar: "https://i.imgur.com/gA2pK9W.png",
        bio: "Construtor de maps e elementos 3D para o servidor.",
        joinedAt: new Date("2023-05-20"),
        displayOrder: 5,
        isActive: true,
        socialLinks: {
          discord: "edgebuilder"
        }
      }
    ];
    
    staffMembers.forEach(member => this.createStaffMember(member));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.discordId === discordId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // News methods
  async getNews(id: number): Promise<News | undefined> {
    return this.newsList.get(id);
  }
  
  async getNewsBySlug(slug: string): Promise<News | undefined> {
    return Array.from(this.newsList.values()).find(
      (article) => article.slug === slug,
    );
  }
  
  async getNewsList(limit = 10, offset = 0, categoryId?: number): Promise<News[]> {
    let articles = Array.from(this.newsList.values())
      .filter(article => article.published)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    if (categoryId) {
      articles = articles.filter(article => article.categoryId === categoryId);
    }
    
    return articles.slice(offset, offset + limit);
  }
  
  async getFeaturedNews(limit = 3): Promise<News[]> {
    return Array.from(this.newsList.values())
      .filter(article => article.published)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }
  
  async createNews(article: InsertNews): Promise<News> {
    const id = this.newsIdCounter++;
    const now = new Date();
    
    const newArticle: News = {
      ...article,
      id,
      publishedAt: now
    };
    
    this.newsList.set(id, newArticle);
    return newArticle;
  }
  
  async updateNews(id: number, data: Partial<InsertNews>): Promise<News | undefined> {
    const article = await this.getNews(id);
    if (!article) return undefined;
    
    const updatedArticle = { ...article, ...data };
    this.newsList.set(id, updatedArticle);
    return updatedArticle;
  }
  
  async deleteNews(id: number): Promise<boolean> {
    return this.newsList.delete(id);
  }
  
  // News Categories methods
  async getNewsCategory(id: number): Promise<NewsCategory | undefined> {
    return this.newsCategories.get(id);
  }
  
  async getNewsCategoryBySlug(slug: string): Promise<NewsCategory | undefined> {
    return Array.from(this.newsCategories.values()).find(
      (category) => category.slug === slug,
    );
  }
  
  async getNewsCategories(): Promise<NewsCategory[]> {
    return Array.from(this.newsCategories.values());
  }
  
  async createNewsCategory(category: InsertNewsCategory): Promise<NewsCategory> {
    const id = this.newsCategoryIdCounter++;
    
    const newCategory: NewsCategory = {
      ...category,
      id
    };
    
    this.newsCategories.set(id, newCategory);
    return newCategory;
  }
  
  async updateNewsCategory(id: number, data: Partial<InsertNewsCategory>): Promise<NewsCategory | undefined> {
    const category = await this.getNewsCategory(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...data };
    this.newsCategories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteNewsCategory(id: number): Promise<boolean> {
    return this.newsCategories.delete(id);
  }
  
  // Staff Applications methods
  async getStaffApplication(id: number): Promise<StaffApplication | undefined> {
    return this.staffApplications.get(id);
  }
  
  async getStaffApplicationsByUserId(userId: number): Promise<StaffApplication[]> {
    return Array.from(this.staffApplications.values())
      .filter(application => application.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getStaffApplications(status?: string, limit = 10, offset = 0): Promise<StaffApplication[]> {
    let applications = Array.from(this.staffApplications.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (status) {
      applications = applications.filter(app => app.status === status);
    }
    
    return applications.slice(offset, offset + limit);
  }
  
  async createStaffApplication(application: InsertStaffApplication): Promise<StaffApplication> {
    const id = this.staffApplicationIdCounter++;
    const now = new Date();
    
    const newApplication: StaffApplication = {
      ...application,
      id,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      adminNotes: "",
    };
    
    this.staffApplications.set(id, newApplication);
    return newApplication;
  }
  
  async updateStaffApplication(id: number, data: Partial<StaffApplication>): Promise<StaffApplication | undefined> {
    const application = await this.getStaffApplication(id);
    if (!application) return undefined;
    
    const updatedApplication = { 
      ...application, 
      ...data,
      updatedAt: new Date() 
    };
    
    this.staffApplications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    return this.settings.get(key);
  }
  
  async getSettingsByCategory(category: string): Promise<Setting[]> {
    return Array.from(this.settings.values())
      .filter(setting => setting.category === category);
  }
  
  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }
  
  async upsertSetting(data: InsertSetting): Promise<Setting> {
    const existingSetting = this.settings.get(data.key);
    
    if (existingSetting) {
      const updatedSetting = { ...existingSetting, value: data.value };
      this.settings.set(data.key, updatedSetting);
      return updatedSetting;
    } else {
      const id = this.settingIdCounter++;
      const newSetting: Setting = { ...data, id };
      this.settings.set(data.key, newSetting);
      return newSetting;
    }
  }
  
  // Staff Members methods
  async getStaffMember(id: number): Promise<StaffMember | undefined> {
    return this.staffMembers.get(id);
  }
  
  async getStaffMemberByUserId(userId: number): Promise<StaffMember | undefined> {
    return Array.from(this.staffMembers.values()).find(
      (member) => member.userId === userId
    );
  }
  
  async getStaffMembers(activeOnly: boolean = false): Promise<StaffMember[]> {
    let members = Array.from(this.staffMembers.values())
      .sort((a, b) => a.displayOrder - b.displayOrder);
    
    if (activeOnly) {
      members = members.filter(member => member.isActive);
    }
    
    return members;
  }
  
  async createStaffMember(member: InsertStaffMember): Promise<StaffMember> {
    const id = this.staffMemberIdCounter++;
    const now = new Date();
    
    const newMember: StaffMember = {
      ...member,
      id,
      createdAt: now,
      updatedAt: now,
      joinedAt: member.joinedAt || now,
      isActive: member.isActive ?? true,
      displayOrder: member.displayOrder ?? 999
    };
    
    this.staffMembers.set(id, newMember);
    return newMember;
  }
  
  async updateStaffMember(id: number, data: Partial<InsertStaffMember>): Promise<StaffMember | undefined> {
    const member = await this.getStaffMember(id);
    if (!member) return undefined;
    
    const updatedMember = { 
      ...member, 
      ...data,
      updatedAt: new Date() 
    };
    
    this.staffMembers.set(id, updatedMember);
    return updatedMember;
  }
  
  async deleteStaffMember(id: number): Promise<boolean> {
    return this.staffMembers.delete(id);
  }
}

export const storage = new MemStorage();
