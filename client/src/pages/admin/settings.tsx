import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Users, 
  FileText, 
  UserCheck, 
  Settings as SettingsIcon, 
  ExternalLink, 
  Globe,
  Key,
  ServerIcon,
  Shield,
  Save,
  Lock,
  Edit
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Setting {
  id: number;
  key: string;
  value: string;
  category: string;
}

const AdminSettings: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [editableSetting, setEditableSetting] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Redirecionar se não estiver autenticado ou não for admin
  React.useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (!isAdmin) {
      setLocation("/");
    }
  }, [isAuthenticated, isAdmin, setLocation]);

  // Buscar configurações
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Erro ao carregar configurações');
      return response.json();
    },
    select: (data) => data.settings as Setting[],
    enabled: isAuthenticated && isAdmin,
  });

  // Mutation para atualizar configuração
  const updateMutation = useMutation({
    mutationFn: async ({ key, value, category }: { key: string, value: string, category: string }) => {
      return apiRequest("PUT", `/api/admin/settings/${key}`, { value, category });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/public"] });
      
      toast({
        title: "Configuração atualizada",
        description: "A configuração foi atualizada com sucesso.",
      });
      
      setEditableSetting(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar configuração",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar a configuração.",
        variant: "destructive",
      });
    }
  });

  const handleEditClick = (setting: Setting) => {
    setEditableSetting(setting.key);
    setEditValue(setting.value);
  };

  const handleSaveClick = (setting: Setting) => {
    updateMutation.mutate({
      key: setting.key,
      value: editValue,
      category: setting.category
    });
  };

  const handleCancelEdit = () => {
    setEditableSetting(null);
  };

  // Agrupar configurações por categoria
  const groupedSettings = React.useMemo(() => {
    if (!settingsData) return {};
    
    return settingsData.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {} as Record<string, Setting[]>);
  }, [settingsData]);

  // Se não estiver autenticado como admin, não renderiza o conteúdo
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#121212]">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-[#1A1A1A] border-r border-[#2D2D2D] overflow-y-auto hidden md:block">
        <div className="p-6">
          <Link href="/">
            <a className="font-rajdhani font-bold text-2xl">
              <span className="text-white">TOKYO</span>
              <span className="text-[#00E5FF]">EDGE</span>
              <span className="text-[#FF0A54]">RP</span>
            </a>
          </Link>
        </div>
        
        <nav className="mt-6">
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Administração
            </p>
          </div>
          
          <Link href="/admin/dashboard">
            <a className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#2D2D2D]">
              <Users className="h-5 w-5 mr-3" />
              Dashboard
            </a>
          </Link>
          
          <Link href="/admin/applications">
            <a className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#2D2D2D]">
              <UserCheck className="h-5 w-5 mr-3" />
              Aplicações
            </a>
          </Link>
          
          <Link href="/admin/news">
            <a className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#2D2D2D]">
              <FileText className="h-5 w-5 mr-3" />
              Notícias
            </a>
          </Link>
          
          <Link href="/admin/settings">
            <a className="flex items-center px-6 py-3 text-white bg-[#FF0A54]/10 border-l-2 border-[#FF0A54]">
              <SettingsIcon className="h-5 w-5 mr-3" />
              Configurações
            </a>
          </Link>
          
          <div className="px-4 py-2 mt-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Acessos Rápidos
            </p>
          </div>
          
          <a 
            href="https://discord.gg/NZAAaAmQtC" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#2D2D2D]"
          >
            <ExternalLink className="h-5 w-5 mr-3" />
            Discord
          </a>
          
          <Link href="/">
            <a className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#2D2D2D]">
              <ExternalLink className="h-5 w-5 mr-3" />
              Ver Site
            </a>
          </Link>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-rajdhani font-bold text-white">
                Configurações do Sistema
              </h1>
              <p className="text-gray-400">
                Gerencie as configurações do servidor e do site
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="server" className="w-full">
            <TabsList className="bg-[#1A1A1A] border-[#2D2D2D] mb-6">
              <TabsTrigger 
                value="server" 
                className="data-[state=active]:bg-[#00E5FF] data-[state=active]:text-black"
              >
                <ServerIcon className="h-4 w-4 mr-2" />
                Servidor
              </TabsTrigger>
              <TabsTrigger 
                value="discord" 
                className="data-[state=active]:bg-[#5865F2] data-[state=active]:text-white"
              >
                <Globe className="h-4 w-4 mr-2" />
                Discord
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="data-[state=active]:bg-[#FF0A54] data-[state=active]:text-white"
              >
                <Shield className="h-4 w-4 mr-2" />
                Segurança
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="server">
              <div className="space-y-4">
                <div className="flex items-center">
                  <ServerIcon className="h-5 w-5 text-[#00E5FF]" />
                  <h2 className="text-xl font-rajdhani font-bold text-white ml-2">Informações do Servidor</h2>
                </div>
                <p className="text-gray-400">Informações básicas sobre seu servidor FiveM</p>
                
                <div className="grid gap-6 mt-4">
                  {isLoading ? (
                    Array(3).fill(0).map((_, index) => (
                      <Card key={index} className="glassmorphism p-4 rounded-lg">
                        <CardContent className="p-0">
                          <div>
                            <Skeleton className="h-5 w-40 bg-[#2D2D2D] mb-2" />
                            <Skeleton className="h-4 w-64 bg-[#2D2D2D] mb-4" />
                          </div>
                          
                          <div className="flex gap-2">
                            <Skeleton className="h-10 flex-1 bg-[#2D2D2D]" />
                            <Skeleton className="h-10 w-10 bg-[#2D2D2D]" />
                          </div>
                          
                          <Skeleton className="h-4 w-40 mt-4 bg-[#2D2D2D]" />
                        </CardContent>
                      </Card>
                    ))
                  ) : groupedSettings["server"]?.map((setting) => (
                    <Card key={setting.key} className="glassmorphism p-4 rounded-lg">
                      <CardContent className="p-0 grid gap-4">
                        <div>
                          <label htmlFor={setting.key} className="text-white font-medium">
                            {setting.key === "server_name" ? "Nome do Servidor" : 
                             setting.key === "server_description" ? "Descrição do Servidor" : 
                             setting.key === "server_connection_url" ? "URL de Conexão" : 
                             setting.key}
                          </label>
                          <p className="text-sm text-gray-400 mt-1">
                            {setting.key === "server_name" ? "O nome que aparecerá na lista de servidores do FiveM" : 
                             setting.key === "server_description" ? "Uma breve descrição do seu servidor" : 
                             setting.key === "server_connection_url" ? "URL para conectar diretamente ao servidor" : 
                             "Configuração do servidor"}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {editableSetting === setting.key ? (
                            <Input
                              id={setting.key}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="bg-[#1A1A1A] border-[#2D2D2D] text-white flex-1"
                            />
                          ) : (
                            <Input
                              id={setting.key}
                              value={setting.value}
                              readOnly
                              className="bg-[#1A1A1A] border-[#2D2D2D] text-white flex-1"
                            />
                          )}
                          
                          {editableSetting === setting.key ? (
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleSaveClick(setting)}
                                className="bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black"
                                disabled={updateMutation.isPending}
                              >
                                <Save className="h-5 w-5" />
                              </Button>
                              <Button 
                                onClick={handleCancelEdit}
                                variant="outline"
                                className="border-[#2D2D2D] text-white"
                              >
                                <XCircle className="h-5 w-5" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              onClick={() => handleEditClick(setting)}
                              className="bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black"
                            >
                              <Edit className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500 italic">
                          Última atualização: {new Date().toLocaleDateString('pt-BR')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="discord">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-[#5865F2]" />
                  <h2 className="text-xl font-rajdhani font-bold text-white ml-2">Configurações do Discord</h2>
                </div>
                <p className="text-gray-400">Configure a integração com o Discord</p>
                
                <div className="grid gap-6 mt-4">
                  {isLoading ? (
                    Array(3).fill(0).map((_, index) => (
                      <Card key={index} className="glassmorphism p-4 rounded-lg">
                        <CardContent className="p-0">
                          <div>
                            <Skeleton className="h-5 w-40 bg-[#2D2D2D] mb-2" />
                            <Skeleton className="h-4 w-64 bg-[#2D2D2D] mb-4" />
                          </div>
                          
                          <div className="flex gap-2">
                            <Skeleton className="h-10 flex-1 bg-[#2D2D2D]" />
                            <Skeleton className="h-10 w-10 bg-[#2D2D2D]" />
                          </div>
                          
                          <Skeleton className="h-4 w-40 mt-4 bg-[#2D2D2D]" />
                        </CardContent>
                      </Card>
                    ))
                  ) : groupedSettings["discord"]?.map((setting) => (
                    <Card key={setting.key} className="glassmorphism p-4 rounded-lg">
                      <CardContent className="p-0 grid gap-4">
                        <div>
                          <label htmlFor={setting.key} className="text-white font-medium">
                            {setting.key === "discord_client_id" ? "Client ID do Discord" : 
                             setting.key === "discord_client_secret" ? "Client Secret do Discord" : 
                             setting.key === "discord_invite_url" ? "URL de Convite do Discord" : 
                             setting.key}
                          </label>
                          <p className="text-sm text-gray-400 mt-1">
                            {setting.key === "discord_client_id" ? "O Client ID da sua aplicação Discord" : 
                             setting.key === "discord_client_secret" ? "O Client Secret da sua aplicação Discord" : 
                             setting.key === "discord_invite_url" ? "Link de convite para o seu servidor Discord" : 
                             "Configuração do Discord"}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {editableSetting === setting.key ? (
                            <Input
                              id={setting.key}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              type={setting.key.includes("secret") ? "password" : "text"}
                              className="bg-[#1A1A1A] border-[#2D2D2D] text-white flex-1"
                            />
                          ) : (
                            <Input
                              id={setting.key}
                              value={setting.key.includes("secret") ? "••••••••••••••••••••••••••••••" : setting.value}
                              readOnly
                              type={setting.key.includes("secret") ? "password" : "text"}
                              className="bg-[#1A1A1A] border-[#2D2D2D] text-white flex-1"
                            />
                          )}
                          
                          {editableSetting === setting.key ? (
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleSaveClick(setting)}
                                className="bg-[#5865F2] hover:bg-[#5865F2]/80 text-white"
                                disabled={updateMutation.isPending}
                              >
                                <Save className="h-5 w-5" />
                              </Button>
                              <Button 
                                onClick={handleCancelEdit}
                                variant="outline"
                                className="border-[#2D2D2D] text-white"
                              >
                                <XCircle className="h-5 w-5" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              onClick={() => handleEditClick(setting)}
                              className="bg-[#5865F2] hover:bg-[#5865F2]/80 text-white"
                            >
                              <Edit className="h-5 w-5" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-500 italic">
                          Última atualização: {new Date().toLocaleDateString('pt-BR')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-[#FF0A54]" />
                  <h2 className="text-xl font-rajdhani font-bold text-white ml-2">Configurações de Segurança</h2>
                </div>
                <p className="text-gray-400">Gerencie as configurações de segurança do sistema</p>
                
                <div className="glassmorphism p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Lock className="h-5 w-5 text-[#FF0A54] mr-2" />
                    <h3 className="text-lg font-rajdhani font-bold text-white">Alterar Senha de Administrador</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="current_password" className="block text-sm font-medium text-white mb-1">
                        Senha Atual
                      </label>
                      <Input
                        id="current_password"
                        type="password"
                        className="bg-[#1A1A1A] border-[#2D2D2D] text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="new_password" className="block text-sm font-medium text-white mb-1">
                        Nova Senha
                      </label>
                      <Input
                        id="new_password"
                        type="password"
                        className="bg-[#1A1A1A] border-[#2D2D2D] text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirm_password" className="block text-sm font-medium text-white mb-1">
                        Confirmar Nova Senha
                      </label>
                      <Input
                        id="confirm_password"
                        type="password"
                        className="bg-[#1A1A1A] border-[#2D2D2D] text-white"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button className="bg-[#FF0A54] hover:bg-[#FF0A54]/80 text-white">
                        Alterar Senha
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="glassmorphism p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <Key className="h-5 w-5 text-[#FF0A54] mr-2" />
                    <h3 className="text-lg font-rajdhani font-bold text-white">Chaves de API</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="api_key" className="block text-sm font-medium text-white mb-1">
                        Chave de API do Servidor FiveM
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="api_key"
                          type="password"
                          value="••••••••••••••••••••••••••••••"
                          readOnly
                          className="bg-[#1A1A1A] border-[#2D2D2D] text-white flex-1"
                        />
                        <Button className="bg-[#FF0A54] hover:bg-[#FF0A54]/80 text-white">
                          Regenerar
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Utilizada para autenticar requisições à API do FiveM.
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="webhook_url" className="block text-sm font-medium text-white mb-1">
                        URL do Webhook Discord
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="webhook_url"
                          type="text"
                          placeholder="https://discord.com/api/webhooks/..."
                          className="bg-[#1A1A1A] border-[#2D2D2D] text-white flex-1"
                        />
                        <Button className="bg-[#FF0A54] hover:bg-[#FF0A54]/80 text-white">
                          Salvar
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Webhook para notificações do Discord.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
