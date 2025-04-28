import React, { useState } from "react";
import { useLocation, useParams, useSearch } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  FileText, 
  UserCheck, 
  Settings, 
  ExternalLink, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Globe,
  Languages,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ApplicationUser {
  id: number;
  username: string;
  discordUsername?: string;
  avatar?: string;
}

interface Application {
  id: number;
  userId: number;
  age: number;
  timezone: string;
  languages: string;
  availability: number;
  rpExperience: string;
  moderationExperience: string;
  serverFamiliarity: string;
  whyJoin: string;
  scenario: string;
  contribution: string;
  additionalInfo?: string;
  status: "pending" | "in_review" | "approved" | "rejected";
  adminNotes?: string;
  reviewedBy?: number;
  createdAt: string;
  updatedAt: string;
  user: ApplicationUser | null;
}

const statusColors = {
  pending: "bg-indigo-500 text-white",
  in_review: "bg-yellow-500 text-white",
  approved: "bg-green-500 text-white",
  rejected: "bg-red-500 text-white"
};

const statusLabels = {
  pending: "Pendente",
  in_review: "Em Análise",
  approved: "Aprovada",
  rejected: "Rejeitada"
};

const serverFamiliarityLabels: Record<string, string> = {
  "less_than_week": "Menos de uma semana",
  "week_to_month": "Entre uma semana e um mês",
  "one_to_three_months": "1-3 meses",
  "three_to_six_months": "3-6 meses",
  "more_than_six_months": "Mais de 6 meses"
};

const AdminApplicationView: React.FC = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams();
  const applicationId = parseInt(params?.id || "0");
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const action = searchParams.get("action");
  
  const { toast } = useToast();
  const [adminNotes, setAdminNotes] = useState("");
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(action === "approve");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(action === "reject");

  // Redirecionar se não estiver autenticado ou não for admin
  React.useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (!isAdmin) {
      setLocation("/");
    }
  }, [isAuthenticated, isAdmin, setLocation]);

  // Buscar detalhes da aplicação
  const { data, isLoading, refetch } = useQuery({
    queryKey: [`/api/admin/applications/${applicationId}`],
    queryFn: async () => {
      const response = await fetch(`/api/admin/applications/${applicationId}`);
      if (!response.ok) throw new Error('Erro ao carregar detalhes da aplicação');
      return response.json();
    },
    select: (data) => data.application as Application,
    enabled: isAuthenticated && isAdmin && !!applicationId,
    onSuccess: (application) => {
      if (application?.adminNotes) {
        setAdminNotes(application.adminNotes);
      }
    }
  });

  // Mutation para atualizar aplicação
  const updateMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string, notes: string }) => {
      return apiRequest("PUT", `/api/admin/applications/${applicationId}`, {
        status,
        adminNotes: notes,
        reviewedBy: user?.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/applications/${applicationId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      
      toast({
        title: "Aplicação atualizada",
        description: "O status da aplicação foi atualizado com sucesso.",
      });
      
      refetch();
      setIsApproveDialogOpen(false);
      setIsRejectDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar aplicação",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar a aplicação.",
        variant: "destructive",
      });
    }
  });

  const handleSaveNotes = () => {
    updateMutation.mutate({ status: data?.status || "pending", notes: adminNotes });
  };

  const handleStatusChange = (status: string) => {
    updateMutation.mutate({ status, notes: adminNotes });
  };

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
            <a className="flex items-center px-6 py-3 text-white bg-[#FF0A54]/10 border-l-2 border-[#FF0A54]">
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
          <div className="flex items-center mb-6">
            <Link href="/admin/applications">
              <a className="mr-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-white hover:bg-[#2D2D2D]"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </a>
            </Link>
            <div>
              <h1 className="text-3xl font-rajdhani font-bold text-white">
                Detalhes da Aplicação
              </h1>
              <p className="text-gray-400">
                Avalie esta candidatura para equipe
              </p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-6">
              <div className="glassmorphism p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <Skeleton className="h-12 w-12 rounded-full bg-[#2D2D2D] mr-4" />
                  <div>
                    <Skeleton className="h-6 w-48 bg-[#2D2D2D] mb-2" />
                    <Skeleton className="h-4 w-32 bg-[#2D2D2D]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-20 bg-[#2D2D2D]" />
                  ))}
                </div>
                <Skeleton className="h-40 bg-[#2D2D2D] mb-4" />
                <div className="flex justify-end space-x-2">
                  <Skeleton className="h-10 w-24 bg-[#2D2D2D]" />
                  <Skeleton className="h-10 w-24 bg-[#2D2D2D]" />
                </div>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Cabeçalho da aplicação */}
              <div className="glassmorphism p-6 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div className="flex items-center mb-4 md:mb-0">
                    {data.user?.avatar ? (
                      <img 
                        src={data.user.avatar} 
                        alt={data.user.username} 
                        className="w-12 h-12 rounded-full mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#2D2D2D] rounded-full flex items-center justify-center text-gray-400 mr-4">
                        {data.user?.username?.charAt(0) || "U"}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-rajdhani font-bold text-white">
                        {data.user?.username || "Usuário"}
                      </h2>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Aplicação enviada em {formatDate(data.createdAt)}</span>
                        {data.user?.discordUsername && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{data.user.discordUsername}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span 
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[data.status]}`}
                    >
                      {statusLabels[data.status]}
                    </span>
                  </div>
                </div>
                
                {/* Informações básicas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-normal text-gray-400 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Idade</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xl font-medium">{data.age} anos</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-normal text-gray-400 flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        <span>Fuso Horário</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xl font-medium">{data.timezone}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-normal text-gray-400 flex items-center">
                        <Languages className="h-4 w-4 mr-2" />
                        <span>Idiomas</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xl font-medium">{data.languages}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-normal text-gray-400 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Disponibilidade</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xl font-medium">{data.availability}h semanais</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Tabs para respostas */}
                <Tabs defaultValue="experience" className="mb-6">
                  <TabsList className="bg-[#1A1A1A] border-[#2D2D2D]">
                    <TabsTrigger value="experience" className="data-[state=active]:bg-[#FF0A54] data-[state=active]:text-white">
                      Experiência
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="data-[state=active]:bg-[#00E5FF] data-[state=active]:text-black">
                      Perguntas
                    </TabsTrigger>
                    {data.additionalInfo && (
                      <TabsTrigger value="additional" className="data-[state=active]:bg-[#a855f7] data-[state=active]:text-white">
                        Informações Adicionais
                      </TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="experience" className="pt-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-[#FF0A54]" />
                          Experiência com Roleplay
                        </h3>
                        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2D2D2D]">
                          <p className="text-gray-300 whitespace-pre-line">{data.rpExperience}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-[#FF0A54]" />
                          Experiência como Moderador/Administrador
                        </h3>
                        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2D2D2D]">
                          <p className="text-gray-300 whitespace-pre-line">{data.moderationExperience}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-[#FF0A54]" />
                          Conhecimento do Servidor
                        </h3>
                        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2D2D2D]">
                          <p className="text-gray-300">
                            {serverFamiliarityLabels[data.serverFamiliarity] || data.serverFamiliarity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="questions" className="pt-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-[#00E5FF]" />
                          Por que deseja se juntar à equipe?
                        </h3>
                        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2D2D2D]">
                          <p className="text-gray-300 whitespace-pre-line">{data.whyJoin}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-[#00E5FF]" />
                          Cenário: Jogador desrespeitando regras de RP
                        </h3>
                        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2D2D2D]">
                          <p className="text-gray-300 whitespace-pre-line">{data.scenario}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-[#00E5FF]" />
                          Contribuição para o servidor
                        </h3>
                        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2D2D2D]">
                          <p className="text-gray-300 whitespace-pre-line">{data.contribution}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {data.additionalInfo && (
                    <TabsContent value="additional" className="pt-4">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-[#a855f7]" />
                          Informações Adicionais
                        </h3>
                        <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#2D2D2D]">
                          <p className="text-gray-300 whitespace-pre-line">{data.additionalInfo}</p>
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
                
                {/* Notas para o Admin */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-2">
                    Notas Administrativas
                  </h3>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Adicione notas sobre esta aplicação (visível apenas para a equipe administrativa)"
                    className="bg-[#1A1A1A] border-[#2D2D2D] text-white min-h-[120px]"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="outline"
                      className="text-[#00E5FF] border-[#00E5FF]/30 hover:bg-[#00E5FF]/10"
                      onClick={handleSaveNotes}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? "Salvando..." : "Salvar Notas"}
                    </Button>
                  </div>
                </div>
                
                {/* Ações */}
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="destructive"
                    onClick={() => setIsRejectDialogOpen(true)}
                    disabled={data.status === "rejected"}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Rejeitar Aplicação
                  </Button>
                  
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setIsApproveDialogOpen(true)}
                    disabled={data.status === "approved"}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Aprovar Aplicação
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glassmorphism p-8 rounded-lg text-center">
              <p className="text-gray-300 mb-4">
                Aplicação não encontrada ou você não tem permissão para visualizá-la.
              </p>
              <Link href="/admin/applications">
                <Button variant="outline" className="border-[#00E5FF] text-[#00E5FF]">
                  Voltar para a lista de aplicações
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Diálogo de confirmação para aprovação */}
      <AlertDialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <AlertDialogContent className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar Aplicação</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Você tem certeza que deseja aprovar esta aplicação? 
              O candidato será notificado sobre a aprovação.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#2D2D2D] text-white hover:bg-[#2D2D2D]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleStatusChange("approved")}
            >
              {updateMutation.isPending ? "Aprovando..." : "Aprovar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Diálogo de confirmação para rejeição */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Aplicação</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Você tem certeza que deseja rejeitar esta aplicação? 
              O candidato será notificado sobre a rejeição.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#2D2D2D] text-white hover:bg-[#2D2D2D]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => handleStatusChange("rejected")}
            >
              {updateMutation.isPending ? "Rejeitando..." : "Rejeitar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminApplicationView;
