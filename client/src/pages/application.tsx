import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/navigation/header";
import Footer from "@/components/navigation/footer";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { getDiscordLoginUrl } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import ApplicationForm from "@/components/application/application-form";

const StaffApplication: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const backgroundStyle = {
    backgroundImage: "url('https://images.unsplash.com/photo-1604076913837-52ab5629fba9?auto=format&fit=crop&w=1920&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const requirements = [
    "Idade 16 ou superior",
    "Boa compreensão dos princípios de roleplay",
    "Membro ativo da comunidade por pelo menos 2 semanas",
    "Capacidade de dedicar pelo menos 15 horas por semana",
    "Atitude profissional e habilidades de resolução de conflitos",
  ];

  const responsibilities = [
    "Aplicar as regras do servidor e manter um ambiente justo",
    "Auxiliar novos jogadores e fornecer orientação",
    "Monitorar o chat e atividades dentro do jogo",
    "Participar de reuniões da staff e sessões de treinamento",
    "Reportar problemas e sugerir melhorias",
  ];

  const handleAgreeClick = () => {
    setAgreedToTerms(true);
    // Scroll to the form section
    const formSection = document.getElementById("application-form");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20" style={backgroundStyle}>
          <div className="absolute inset-0 bg-[#0F1A2C] bg-opacity-80"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl font-rajdhani font-bold mb-6">
                <span className="text-white">APLICAÇÃO PARA</span>
                <span className="text-[#FF0A54]"> STAFF</span>
              </h1>
              <p className="text-xl text-gray-300 mb-10">
                Junte-se à nossa equipe e ajude a moldar o futuro do Tokyo Edge Roleplay
              </p>
            </motion.div>
          </div>
        </section>

        {/* Information Section */}
        <section className="py-16 bg-[#121212]">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto glassmorphism p-8 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-rajdhani font-bold text-white mb-6 text-center">
                Informações da Posição
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-rajdhani font-bold text-[#00E5FF] mb-4">
                    Sobre a Posição
                  </h3>
                  <p className="text-gray-300 mb-4">
                    O Tokyo Edge Roleplay está procurando por pessoas dedicadas para se juntar à nossa equipe de staff. 
                    Como membro da staff, você terá um papel crucial na manutenção da qualidade da nossa comunidade 
                    e em garantir que todos os jogadores tenham uma experiência agradável.
                  </p>
                  <p className="text-gray-300">
                    Esta é uma posição voluntária com potencial para progredir para nossa equipe remunerada após 
                    um período de avaliação de 3 meses. Membros da staff recebem acesso VIP completo, ferramentas especiais no jogo, 
                    e experiência valiosa em gerenciamento de comunidade.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-rajdhani font-bold text-[#FF0A54] mb-4">
                      Requisitos
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      {requirements.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 text-[#FF0A54] mr-2 mt-0.5 flex-shrink-0" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-rajdhani font-bold text-[#00E5FF] mb-4">
                      Responsabilidades
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      {responsibilities.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 text-[#00E5FF] mr-2 mt-0.5 flex-shrink-0" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-rajdhani font-bold text-white mb-4">
                    Processo de Aplicação
                  </h3>
                  <ol className="space-y-4 text-gray-300">
                    <li className="flex">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF0A54] flex items-center justify-center text-white font-bold mr-3">1</span>
                      <div>
                        <h4 className="font-rajdhani font-bold text-white">
                          Autenticação Discord
                        </h4>
                        <p>Faça login com sua conta Discord para verificar sua identidade.</p>
                      </div>
                    </li>
                    <li className="flex">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF0A54] flex items-center justify-center text-white font-bold mr-3">2</span>
                      <div>
                        <h4 className="font-rajdhani font-bold text-white">
                          Formulário de Aplicação
                        </h4>
                        <p>Preencha o formulário detalhado abaixo.</p>
                      </div>
                    </li>
                    <li className="flex">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF0A54] flex items-center justify-center text-white font-bold mr-3">3</span>
                      <div>
                        <h4 className="font-rajdhani font-bold text-white">
                          Entrevista
                        </h4>
                        <p>Candidatos selecionados serão convidados para uma entrevista com nossa equipe administrativa.</p>
                      </div>
                    </li>
                    <li className="flex">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#FF0A54] flex items-center justify-center text-white font-bold mr-3">4</span>
                      <div>
                        <h4 className="font-rajdhani font-bold text-white">
                          Período de Treinamento
                        </h4>
                        <p>Duas semanas de treinamento com um membro experiente da staff para aprender nossos sistemas.</p>
                      </div>
                    </li>
                  </ol>
                </div>
                
                <div className="text-center pt-4">
                  {!isAuthenticated ? (
                    <div className="space-y-4">
                      <p className="text-white">
                        Você precisa se autenticar com o Discord para se candidatar.
                      </p>
                      <a href={getDiscordLoginUrl("/application")}>
                        <Button className="bg-[#5865F2] hover:bg-[#5865F2]/80 text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            className="mr-2"
                          >
                            <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                          </svg>
                          Entrar com Discord
                        </Button>
                      </a>
                    </div>
                  ) : !agreedToTerms ? (
                    <div className="space-y-4">
                      <p className="text-white mb-6">
                        Ao se candidatar, você concorda com nossas diretrizes de conduta e acordo de confidencialidade.
                      </p>
                      <Button 
                        className="cyberpunk-btn px-8 py-3 rounded bg-[#FF0A54] text-white font-rajdhani font-bold text-lg hover:shadow-[0_0_15px_rgba(255,10,84,0.7)] transition-all"
                        onClick={handleAgreeClick}
                      >
                        CONCORDAR E CONTINUAR
                      </Button>
                    </div>
                  ) : (
                    <p className="text-white">
                      Por favor, preencha o formulário de aplicação abaixo.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Application Form Section */}
        {isAuthenticated && agreedToTerms && (
          <section id="application-form" className="py-16 bg-gradient-to-b from-[#121212] to-[#1E1E1E]">
            <div className="container mx-auto px-4">
              <ApplicationForm 
                discordId={user?.discordId || ""}
                discordUsername={user?.discordUsername}
              />
              
              <div className="max-w-4xl mx-auto mt-8 text-center">
                <p className="text-gray-400">
                  Após enviar sua aplicação, nossa equipe irá revisá-la.
                  Procuramos responder a todas as aplicações dentro de 7 dias.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default StaffApplication;
