import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  FileText, 
  UserCheck, 
  AlertTriangle, 
  Clock, 
  Settings,
  ChevronRight,
  ExternalLink
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  // Redirecionar se não estiver autenticado ou não for admin
  React.useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (!isAdmin) {
      setLocation("/");
    }
  }, [isAuthenticated, isAdmin, setLocation]);

  // Buscar estatísticas do servidor
  const { data: serverStats, isLoading: isLoadingServerStats } = useQuery({
    queryKey: ["/api/server/status"],
    staleTime: 60000, // 1 minuto
  });

  // Buscar aplicações pendentes (resumo)
  const { data: pendingApplications, isLoading: isLoadingApplications } = useQuery({
    queryKey: ["/api/admin/applications", "pending"],
    queryFn: async () => {
      const response = await fetch('/api/admin/applications?status=pending&limit=5');
      if (!response.ok) throw new Error('Erro ao carregar aplicações');
      return response.json();
    },
    select: (data) => data.applications,
    enabled: isAuthenticated && isAdmin,
  });

  // Dados para o gráfico (poderia vir de uma API em um caso real)
  const playerData = [
    { dia: 'Seg', jogadores: 54 },
    { dia: 'Ter', jogadores: 67 },
    { dia: 'Qua', jogadores: 82 },
    { dia: 'Qui', jogadores: 78 },
    { dia: 'Sex', jogadores: 91 },
    { dia: 'Sáb', jogadores: 105 },
    { dia: 'Dom', jogadores: 98 },
  ];

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
            <a className="flex items-center px-6 py-3 text-white bg-[#FF0A54]/10 border-l-2 border-[#FF0A54]">
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
            <a className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#2D2D2D]">
              <Settings className="h-5 w-5 mr-3" />
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
          <h1 className="text-3xl font-rajdhani font-bold text-white mb-6">
            Painel Administrativo
          </h1>
          
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400">Jogadores Online</p>
                    {isLoadingServerStats ? (
                      <Skeleton className="h-8 w-16 mt-1 bg-[#2D2D2D]" />
                    ) : (
                      <p className="text-2xl font-bold">
                        {serverStats?.players}/{serverStats?.maxPlayers}
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400">Aplicações Pendentes</p>
                    {isLoadingApplications ? (
                      <Skeleton className="h-8 w-16 mt-1 bg-[#2D2D2D]" />
                    ) : (
                      <p className="text-2xl font-bold">
                        {pendingApplications?.length || 0}
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400">Último Restart</p>
                    {isLoadingServerStats ? (
                      <Skeleton className="h-8 w-24 mt-1 bg-[#2D2D2D]" />
                    ) : (
                      <p className="text-2xl font-bold">
                        {serverStats?.lastRestart 
                          ? new Date(serverStats.lastRestart).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400">Ping</p>
                    {isLoadingServerStats ? (
                      <Skeleton className="h-8 w-16 mt-1 bg-[#2D2D2D]" />
                    ) : (
                      <p className="text-2xl font-bold">
                        {serverStats?.ping || 'N/A'} ms
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Gráficos e Análises */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-[#1A1A1A] border-[#2D2D2D] text-white lg:col-span-2">
              <CardHeader>
                <CardTitle>Estatísticas de Jogadores</CardTitle>
                <CardDescription className="text-gray-400">
                  Média de jogadores por dia da semana
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={playerData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                      <XAxis dataKey="dia" tick={{ fill: '#888' }} />
                      <YAxis tick={{ fill: '#888' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1A1A', 
                          border: '1px solid #2D2D2D', 
                          borderRadius: '8px',
                          color: 'white'
                        }} 
                      />
                      <Bar dataKey="jogadores" fill="#00E5FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
              <CardHeader>
                <CardTitle>Aplicações Recentes</CardTitle>
                <CardDescription className="text-gray-400">
                  Últimas aplicações para staff
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingApplications ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-10 w-10 rounded-full bg-[#2D2D2D]" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24 bg-[#2D2D2D]" />
                          <Skeleton className="h-3 w-32 bg-[#2D2D2D]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pendingApplications?.length > 0 ? (
                  <div className="space-y-4">
                    {pendingApplications.slice(0, 3).map((app: any) => (
                      <div key={app.id} className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-[#2D2D2D] flex items-center justify-center">
                          {app.user?.avatar ? (
                            <img 
                              src={app.user.avatar} 
                              alt={app.user.username} 
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <Users className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{app.user?.username || "Usuário"}</p>
                          <p className="text-sm text-gray-400">Idade: {app.age} • {new Date(app.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <Link href={`/admin/applications/${app.id}`}>
                          <a className="text-[#00E5FF] hover:text-[#00E5FF]/80">
                            <ChevronRight className="h-5 w-5" />
                          </a>
                        </Link>
                      </div>
                    ))}
                    
                    <Link href="/admin/applications">
                      <a className="block text-center text-sm text-[#00E5FF] hover:text-[#00E5FF]/80 mt-2">
                        Ver todas as aplicações
                      </a>
                    </Link>
                  </div>
                ) : (
                  <p className="text-center text-gray-400">
                    Nenhuma aplicação pendente no momento.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Ações Rápidas */}
          <Card className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription className="text-gray-400">
                Acesse as principais funcionalidades do painel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/admin/news/new">
                  <a className="glassmorphism p-4 rounded-lg flex items-center hover:border-[#00E5FF] border border-transparent transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#00E5FF]/20 flex items-center justify-center mr-4">
                      <FileText className="h-5 w-5 text-[#00E5FF]" />
                    </div>
                    <div>
                      <p className="font-medium">Nova Notícia</p>
                      <p className="text-sm text-gray-400">Criar publicação</p>
                    </div>
                  </a>
                </Link>
                
                <Link href="/admin/applications">
                  <a className="glassmorphism p-4 rounded-lg flex items-center hover:border-[#00E5FF] border border-transparent transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[#FF0A54]/20 flex items-center justify-center mr-4">
                      <UserCheck className="h-5 w-5 text-[#FF0A54]" />
                    </div>
                    <div>
                      <p className="font-medium">Revisar Aplicações</p>
                      <p className="text-sm text-gray-400">Avaliar candidatos</p>
                    </div>
                  </a>
                </Link>
                
                <Link href="/admin/settings">
                  <a className="glassmorphism p-4 rounded-lg flex items-center hover:border-[#00E5FF] border border-transparent transition-colors">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                      <Settings className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Configurações</p>
                      <p className="text-sm text-gray-400">Ajustar servidor</p>
                    </div>
                  </a>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
