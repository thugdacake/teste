import React, { useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { getDiscordLoginUrl, login } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { isAuthenticated, refetchUser } = useAuth();
  const { toast } = useToast();

  // Se já estiver autenticado, redireciona para a página inicial
  React.useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(username, password);
      await refetchUser();
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo(a) de volta!",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Credenciais inválidas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#121212]">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-4"
        >
          <Card className="glassmorphism p-8 rounded-lg border border-[#2D2D2D]">
            <CardContent className="p-0">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-rajdhani font-bold text-white mb-2">
                  ENTRAR NO <span className="text-[#00E5FF]">TOKYO EDGE</span>
                </h1>
                <p className="text-gray-400">
                  Entre com sua conta do Discord para acessar a aplicação de staff
                  e gerenciar seu perfil.
                </p>
              </div>
              
              <Tabs defaultValue="discord" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6 bg-[#1A1A1A]">
                  <TabsTrigger value="discord" className="data-[state=active]:bg-[#5865F2] data-[state=active]:text-white">
                    Discord
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="data-[state=active]:bg-[#FF0A54] data-[state=active]:text-white">
                    Admin
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="discord" className="space-y-6">
                  <div className="space-y-4">
                    <a href={getDiscordLoginUrl()} className="block w-full">
                      <Button 
                        className="w-full py-3 bg-[#5865F2] hover:bg-[#5865F2]/80 text-white rounded-md font-medium flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          className="mr-2"
                        >
                          <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
                        </svg>
                        Entrar com Discord
                      </Button>
                    </a>
                  </div>
                </TabsContent>
                
                <TabsContent value="admin" className="space-y-6">
                  <form onSubmit={handleAdminLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white">
                        Nome de Usuário
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Digite seu nome de usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-[#1A1A1A] border-[#2D2D2D] text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white">
                        Senha
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-[#1A1A1A] border-[#2D2D2D] text-white"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-[#FF0A54] hover:bg-[#FF0A54]/80 text-white" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
              
              <div className="text-center mt-6">
                <p className="text-gray-500 text-sm">
                  Ao fazer login, você concorda com nossos{" "}
                  <a href="/terms" className="text-[#00E5FF] hover:underline">
                    Termos de Serviço
                  </a>{" "}
                  e{" "}
                  <a href="/privacy" className="text-[#00E5FF] hover:underline">
                    Política de Privacidade
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LoginPage;
