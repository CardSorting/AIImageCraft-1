import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "@/pages/landing";
import Gallery from "@/pages/gallery";
import Generate from "@/pages/generate";
import History from "@/pages/history";
import Profile from "@/pages/profile-refactored";
import ModelsPage from "@/pages/models-refactored";
import ModelDetailPage from "@/pages/model-detail";
import DreamCreditsPage from "@/pages/dreamcredits";
import CheckoutPage from "@/pages/checkout";
import AICosplayPage from "@/pages/ai-cosplay";
import AIDesignerPage from "@/pages/ai-designer";
import PrivacyPolicy from "@/pages/privacy-policy";
import Terms from "@/pages/terms";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/create" component={Generate} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/generate" component={Generate} />
      <Route path="/history" component={History} />
      <Route path="/profile" component={Profile} />
      <Route path="/models" component={ModelsPage} />
      <Route path="/model/:id" component={ModelDetailPage} />
      <Route path="/models/:id" component={ModelDetailPage} />
      <Route path="/credits" component={DreamCreditsPage} />
      <Route path="/dreamcredits" component={DreamCreditsPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/ai-cosplay" component={AICosplayPage} />
      <Route path="/ai-designer" component={AIDesignerPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={Terms} />
      <Route path="/terms-of-service" component={Terms} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <MobileLayout>
            <Router />
            <Toaster />
          </MobileLayout>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
