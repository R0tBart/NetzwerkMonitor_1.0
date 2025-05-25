// src/App.tsx

import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Security from "@/pages/security";
import Alerts from "@/pages/alerts";
// import Settings from "@/pages/settings";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import Passwords from "@/pages/passwords";
import Analytics from "@/pages/analytics";
import Devices from "@/pages/devices";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/devices" component={Devices} />
      <Route path="/security" component={Security} />
      <Route path="/passwords" component={Passwords} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;