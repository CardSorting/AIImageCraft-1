import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileLayout } from "@/components/layout/MobileLayout";
import Home from "@/pages/home";
import ForYouFeed from "@/pages/for-you";
import Gallery from "@/pages/gallery";
import Generate from "@/pages/generate";
import History from "@/pages/history";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ForYouFeed} />
      <Route path="/create" component={Generate} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/generate" component={Generate} />
      <Route path="/history" component={History} />
      <Route path="/profile" component={Profile} />
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
