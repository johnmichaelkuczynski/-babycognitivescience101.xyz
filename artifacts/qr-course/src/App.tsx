import { useEffect, useState } from "react";
import {
  Switch,
  Route,
  Router as WouterRouter,
  Redirect,
  useLocation,
} from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/Dashboard";
import Assignments from "@/pages/Assignments";
import Analytics from "@/pages/Analytics";
import WeekView from "@/pages/WeekView";
import LectureView from "@/pages/LectureView";
import AssignmentRunner from "@/pages/AssignmentRunner";
import PracticeAssignment from "@/pages/PracticeAssignment";
import Diagnostics from "@/pages/Diagnostics";
import TopicPractice from "@/pages/TopicPractice";
import Reasoning from "@/pages/Reasoning";
import ReasoningRunner from "@/pages/ReasoningRunner";
import Grades from "@/pages/Grades";
import AdminMode from "@/pages/AdminMode";
import Administrative from "@/pages/Administrative";
import LoginGate from "@/components/LoginGate";
import { AuthProvider, useAuthUser } from "@/lib/useAuthUser";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const queryClient = new QueryClient();

// --- SEO: unique document title per route ---
const TITLE_SUFFIX = "Cognitive Science 101";
const ROUTE_TITLES: Array<[RegExp, string]> = [
  [/^\/dashboard/, "Dashboard"],
  [/^\/assignments\/.+\/practice/, "Practice Assignment"],
  [/^\/assignments\/.+/, "Homework"],
  [/^\/assignments/, "Assignments"],
  [/^\/analytics/, "Analytics"],
  [/^\/reasoning\/.+/, "Reasoning Assessment"],
  [/^\/reasoning/, "Reasoning"],
  [/^\/grades/, "Grades"],
  [/^\/admin$/, "Admin Mode"],
  [/^\/administrative/, "Site Analytics"],
  [/^\/diagnostics/, "Diagnostics"],
  [/^\/weeks\/.+/, "Course Section"],
  [/^\/lectures\/.+/, "Lecture"],
  [/^\/practice\/topic\/.+/, "Topic Practice"],
];

function PageTitle() {
  const [location] = useLocation();
  useEffect(() => {
    const match = ROUTE_TITLES.find(([re]) => re.test(location));
    document.title = match
      ? `${match[1]} — ${TITLE_SUFFIX}`
      : `${TITLE_SUFFIX} — AI-Taught Online Course on How the Mind Works`;
  }, [location]);
  return null;
}

// --- Unique-visitor tracking: fires once per app load for every visitor ---
function useTrackVisit() {
  useEffect(() => {
    fetch(`${basePath}/api/track/visit`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, []);
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/assignments" component={Assignments} />
      <Route
        path="/assignments/:id/practice"
        component={PracticeAssignment}
      />
      <Route path="/assignments/:id" component={AssignmentRunner} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/reasoning" component={Reasoning} />
      <Route path="/reasoning/:id" component={ReasoningRunner} />
      <Route path="/grades" component={Grades} />
      <Route path="/admin" component={AdminMode} />
      <Route path="/administrative" component={Administrative} />
      <Route path="/diagnostics" component={Diagnostics} />
      <Route path="/weeks/:weekNumber" component={WeekView} />
      <Route path="/lectures/:lectureId" component={LectureView} />
      <Route path="/practice/topic/:topicId" component={TopicPractice} />
      <Route component={NotFound} />
    </Switch>
  );
}

// No login wall: everyone can browse and try the app. When the server says
// the anonymous free-AI budget is used up (401 LOGIN_REQUIRED), show a
// sign-in prompt over the app.
function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthUser();
  const [loginPrompt, setLoginPrompt] = useState(false);

  useEffect(() => {
    const handler = () => setLoginPrompt(true);
    window.addEventListener("api:login-required", handler);
    return () => window.removeEventListener("api:login-required", handler);
  }, []);

  useEffect(() => {
    if (user) setLoginPrompt(false);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {children}
      {!user && loginPrompt && (
        <LoginGate modal onDismiss={() => setLoginPrompt(false)} />
      )}
    </>
  );
}

function App() {
  useTrackVisit();
  return (
    <WouterRouter base={basePath}>
      <PageTitle />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <AuthGate>
              <Router />
              <Toaster />
            </AuthGate>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
