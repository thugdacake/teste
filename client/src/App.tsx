import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";

// Páginas
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import NewsIndex from "@/pages/news/index";
import NewsArticle from "@/pages/news/article";
import Application from "@/pages/application";
import Login from "@/pages/login";
import TermsOfService from "@/pages/terms";
import PrivacyPolicy from "@/pages/privacy";
import TeamPage from "@/pages/team";

// Páginas Admin
import AdminDashboard from "@/pages/admin/dashboard";
import AdminNewsIndex from "@/pages/admin/news/index";
import AdminNewsEditor from "@/pages/admin/news/editor";
import AdminApplicationsIndex from "@/pages/admin/applications/index";
import AdminApplicationView from "@/pages/admin/applications/view";
import AdminSettings from "@/pages/admin/settings";

function Router() {
  return (
    <Switch>
      {/* Páginas Públicas */}
      <Route path="/" component={Home} />
      <Route path="/news" component={NewsIndex} />
      <Route path="/news/:slug" component={NewsArticle} />
      <Route path="/application" component={Application} />
      <Route path="/login" component={Login} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/team" component={TeamPage} />
      
      {/* Páginas Admin */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/news" component={AdminNewsIndex} />
      <Route path="/admin/news/new" component={AdminNewsEditor} />
      <Route path="/admin/news/edit/:id" component={AdminNewsEditor} />
      <Route path="/admin/applications" component={AdminApplicationsIndex} />
      <Route path="/admin/applications/:id" component={AdminApplicationView} />
      <Route path="/admin/settings" component={AdminSettings} />

      {/* Fallback para 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
