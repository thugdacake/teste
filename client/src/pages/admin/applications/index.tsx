import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Users, 
  FileText, 
  UserCheck, 
  Settings, 
  ExternalLink 
} from "lucide-react";
import { Link } from "wouter";
import ApplicationList from "@/components/admin/application-list";

const AdminApplicationsIndex: React.FC = () => {
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

  const handleViewApplication = (id: number) => {
    setLocation(`/admin/applications/${id}`);
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-rajdhani font-bold text-white">
                Gerenciar Aplicações
              </h1>
              <p className="text-gray-400">
                Revise e gerencie as aplicações para staff
              </p>
            </div>
          </div>
          
          <ApplicationList onViewApplication={handleViewApplication} />
        </div>
      </div>
    </div>
  );
};

export default AdminApplicationsIndex;
