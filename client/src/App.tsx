import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Campaigns from "./pages/Campaigns";
import Workflows from "./pages/Workflows";
import WorkflowBuilder from "./pages/WorkflowBuilder";
import TemplateGallery from "./pages/TemplateGallery";
import Tickets from "./pages/Tickets";
import Orders from "./pages/Orders";
import Integrations from "./pages/Integrations";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import KnowledgeBase from "./pages/KnowledgeBase";
import AISettings from "./pages/AISettings";
import TicketDetail from "./pages/TicketDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/workflows" component={Workflows} />
      <Route path="/workflows/builder/:id?" component={WorkflowBuilder} />
      <Route path="/workflows/templates" component={TemplateGallery} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/tickets/:id" component={TicketDetail} />
      <Route path="/orders" component={Orders} />
      <Route path="/integrations" component={Integrations} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route path="/ai-settings" component={AISettings} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <DashboardLayout>
            <Router />
          </DashboardLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
