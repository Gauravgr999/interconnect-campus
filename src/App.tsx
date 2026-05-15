import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/auth/Auth.tsx";
import Onboarding from "./pages/auth/Onboarding.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Feed from "./pages/app/Feed.tsx";
import Network from "./pages/app/Network.tsx";
import Events from "./pages/app/Events.tsx";
import Chat from "./pages/app/Chat.tsx";
import ChatRoom from "./pages/app/ChatRoom.tsx";
import Profile from "./pages/app/Profile.tsx";
import AIHub from "./pages/app/ai/AIHub.tsx";
import Assistant from "./pages/app/ai/Assistant.tsx";
import Resume from "./pages/app/ai/Resume.tsx";
import Notes from "./pages/app/ai/Notes.tsx";
import Interview from "./pages/app/ai/Interview.tsx";
import PDFSummarizer from "./pages/app/ai/PDFSummarizer.tsx";
import ProjectIdeas from "./pages/app/ai/ProjectIdeas.tsx";
import Career from "./pages/app/ai/Career.tsx";
import Roadmap from "./pages/app/ai/Roadmap.tsx";
import Planner from "./pages/app/ai/Planner.tsx";
import Research from "./pages/app/ai/Research.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/app" element={<Feed />} />
            <Route path="/app/feed" element={<Feed />} />
            <Route path="/app/network" element={<Network />} />
            <Route path="/app/events" element={<Events />} />
            <Route path="/app/chat" element={<Chat />} />
            <Route path="/app/chat/:roomId" element={<ChatRoom />} />
            <Route path="/app/profile" element={<Profile />} />
            <Route path="/app/ai" element={<AIHub />} />
            <Route path="/app/ai/assistant" element={<Assistant />} />
            <Route path="/app/ai/resume" element={<Resume />} />
            <Route path="/app/ai/notes" element={<Notes />} />
            <Route path="/app/ai/interview" element={<Interview />} />
            <Route path="/app/ai/pdf" element={<PDFSummarizer />} />
            <Route path="/app/ai/ideas" element={<ProjectIdeas />} />
            <Route path="/app/ai/career" element={<Career />} />
            <Route path="/app/ai/roadmap" element={<Roadmap />} />
            <Route path="/app/ai/planner" element={<Planner />} />
            <Route path="/app/ai/research" element={<Research />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
