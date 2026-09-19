import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { AppShell } from '@/components/shell';
import { AppStateProvider } from '@/lib/app-state';
import VerifyPage from '@/pages/verify';
import FamilyPage from '@/pages/family';
import HistoryPage from '@/pages/history';
import AlertsPage from '@/pages/alerts';
import ProfilePage from '@/pages/profile';
import { FirstLaunchOnboarding, shouldShowOnboarding } from '@/components/onboarding';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <AppShell>
        <Switch>
          <Route path="/" component={VerifyPage} />
          <Route path="/bouclier" component={FamilyPage} />
          <Route path="/historique" component={HistoryPage} />
          <Route path="/alertes" component={AlertsPage} />
          <Route path="/profil" component={ProfilePage} />
          <Route component={NotFound} />
        </Switch>
      </AppShell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppStateProvider>
          {showOnboarding ? (
            <FirstLaunchOnboarding onComplete={() => setShowOnboarding(false)} />
          ) : (
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
          )}
        </AppStateProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
