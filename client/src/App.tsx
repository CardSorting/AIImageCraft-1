import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileLayout } from "@/components/layout/MobileLayout";
import SimpleHome from "@/pages/simple-home";
import Gallery from "@/pages/gallery";
import Generate from "@/pages/generate";
import History from "@/pages/history";
import Profile from "@/pages/profile-refactored";
import ModelsPage from "@/pages/models-refactored";
import ModelDetailPage from "@/pages/model-detail";
import DreamCreditsPage from "@/pages/dreamcredits";
import CheckoutPage from "@/pages/checkout";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SimpleHome} />
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MobileLayout>
          <Router />
          <Toaster />
        </MobileLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
