import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PipecatClient } from "@pipecat-ai/client-js";
import { PipecatClientProvider, PipecatClientAudio } from "@pipecat-ai/client-react";
import { DailyTransport } from "@pipecat-ai/daily-transport";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Create the Pipecat client instance
const pipecatClient = new PipecatClient({
  transport: new DailyTransport(),
  enableMic: true,
  enableCam: true,
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PipecatClientProvider client={pipecatClient}>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        {/* Add PipecatClientAudio for bot audio playback */}
        <PipecatClientAudio />
      </PipecatClientProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;