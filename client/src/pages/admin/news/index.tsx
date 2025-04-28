import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
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
  PlusCircle,
  Edit,
  Trash2,
  EyeIcon,
  Search,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  published: boolean;
  category: {
    id: number;
    name: string;
    slug: string;
    color: string;
  } | null;
}

const AdminNewsIndex: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // Redirecionar se não estiver autenticado ou não for admin
  React.useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    } else if (!isAdmin) {
      setLocation("/");
    }
  }, [isAuthenticated, isAdmin, setLocation]);

  // Buscar todas as notícias
  const { data: articles, isLoading } = useQuery({
    queryKey: ["/api/news", "all"],
    queryFn: async () => {
      const response = await fetch('/api/news?limit=100');
      if (!response.ok) throw new Error('Erro ao carregar notícias');
      return response.json();
    },
    select: (data) => data.articles as NewsArticle[],
    enabled: isAuthenticated && isAdmin,
  });

  // Mutação para excluir notícia
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/admin/news/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Notícia excluída",
        description: "A notícia foi excluída com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setDeleteId(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir notícia",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir a notícia.",
        variant: "destructive",
      });
    },
  });

  // Filtrar artigos
  const filteredArticles = articles?.filter(article => 
    article.title.toLowerCase().includes(search.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(search.toLowerCase()) ||
    article.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  // Função para confirmar exclusão
  const confirmDelete = (id: number) => {
    setDeleteId(id);
  };

  // Função para executar exclusão
  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
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
            <a className="flex items-center px-6 py-3 text-gray-400 hover:text-white hover:bg-[#2D2D2D]">
              <UserCheck className="h-5 w-5 mr-3" />
              Aplicações
            </a>
          </Link>
          
          <Link href="/admin/news">
            <a className="flex items-center px-6 py-3 text-white bg-[#FF0A54]/10 border-l-2 border-[#FF0A54]">
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-rajdhani font-bold text-white">
                Gerenciar Notícias
              </h1>
              <p className="text-gray-400">
                Crie, edite ou exclua notícias do site
              </p>
            </div>
            
            <Link href="/admin/news/new">
              <a>
                <Button className="bg-[#00E5FF] hover:bg-[#00E5FF]/80 text-black">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nova Notícia
                </Button>
              </a>
            </Link>
          </div>
          
          {/* Barra de busca */}
          <div className="glassmorphism p-4 rounded-lg mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Buscar notícias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#1A1A1A] border-[#2D2D2D] text-white w-full"
              />
            </div>
          </div>
          
          {/* Lista de notícias */}
          <div className="glassmorphism rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1A1A1A] border-b border-[#2D2D2D]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D2D2D]">
                  {isLoading ? (
                    Array(5).fill(0).map((_, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">
                          <Skeleton className="h-5 w-48 bg-[#2D2D2D]" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-5 w-24 bg-[#2D2D2D]" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-5 w-32 bg-[#2D2D2D]" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-5 w-20 bg-[#2D2D2D]" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-8 w-16 bg-[#2D2D2D] ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : filteredArticles && filteredArticles.length > 0 ? (
                    filteredArticles.map((article) => (
                      <tr key={article.id} className="hover:bg-[#1A1A1A]">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 flex-shrink-0 mr-3 rounded overflow-hidden">
                              <img 
                                src={article.coverImage} 
                                alt={article.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="truncate max-w-xs">
                              <div className="text-white font-medium">{article.title}</div>
                              <div className="text-gray-400 text-sm truncate">{article.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {article.category ? (
                            <span 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                              style={{ 
                                backgroundColor: `${article.category.color}20`, 
                                color: article.category.color 
                              }}
                            >
                              {article.category.name}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {formatDate(article.publishedAt)}
                        </td>
                        <td className="px-6 py-4">
                          {article.published ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                              Publicado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
                              Rascunho
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="border-[#2D2D2D] text-gray-300">
                                Ações <ChevronDown className="ml-2 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
                              <DropdownMenuItem asChild>
                                <Link href={`/news/${article.slug}`}>
                                  <a className="flex items-center cursor-pointer">
                                    <EyeIcon className="mr-2 h-4 w-4" />
                                    <span>Visualizar</span>
                                  </a>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/news/edit/${article.id}`}>
                                  <a className="flex items-center cursor-pointer">
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                  </a>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-500 focus:text-red-500" 
                                onClick={() => confirmDelete(article.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Excluir</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        {search ? (
                          <div>
                            <p>Nenhuma notícia encontrada com o termo "{search}".</p>
                            <Button variant="link" onClick={() => setSearch("")} className="text-[#00E5FF]">
                              Limpar busca
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <p>Nenhuma notícia encontrada.</p>
                            <Link href="/admin/news/new">
                              <Button variant="link" className="text-[#00E5FF]">
                                Criar primeira notícia
                              </Button>
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-[#1A1A1A] border-[#2D2D2D] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-[#2D2D2D] text-white hover:bg-[#2D2D2D]">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminNewsIndex;
