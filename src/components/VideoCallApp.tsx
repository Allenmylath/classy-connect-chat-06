import { useState, useCallback } from "react";
import { StartupForm } from "./StartupForm";
import { ChatConsole } from "./ChatConsole";
import { ConnectionButton } from "./ConnectionButton";
import { WelcomeBanner } from "./WelcomeBanner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageCircle } from "lucide-react";
import { RTVIEvent } from "@pipecat-ai/client-js";
import { useRTVIClientEvent } from "@pipecat-ai/client-react";

export function VideoCallApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
    // Reset bot speaking state when disconnected
    if (!connected) {
      setIsBotSpeaking(false);
    }
  };

  // Listen to bot started speaking event
  useRTVIClientEvent(
    RTVIEvent.BotStartedSpeaking,
    useCallback(() => {
      console.log("🤖 Bot started speaking - animation started");
      setIsBotSpeaking(true);
    }, [])
  );

  // Listen to bot stopped speaking event
  useRTVIClientEvent(
    RTVIEvent.BotStoppedSpeaking,
    useCallback(() => {
      console.log("🤖 Bot stopped speaking - animation stopped");
      setIsBotSpeaking(false);
    }, [])
  );

  // Stop animation when disconnected
  useRTVIClientEvent(
    RTVIEvent.Disconnected,
    useCallback(() => {
      console.log("🔌 Disconnected - stopping animation");
      setIsBotSpeaking(false);
    }, [])
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <WelcomeBanner />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className={`text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2 transition-all duration-300 ${
              isBotSpeaking ? 'animate-pulse scale-105' : ''
            }`}>
              SuperBryn- Bryn storm
            </h1>
          </div>
          
          {/* Connection Button - Top Right */}
          <div className="flex-shrink-0">
            <ConnectionButton onConnectionChange={handleConnectionChange} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex justify-center h-[calc(100vh-200px)]">
          {/* Form Section - Full Width */}
          <div className={`w-full max-w-2xl transition-all duration-300 ${
            isBotSpeaking ? 'animate-pulse' : ''
          }`}>
            <StartupForm isConnected={isConnected} />
          </div>
        </div>

        {/* Floating Chat Button */}
        <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
          <SheetTrigger asChild>
            <Button 
              size="lg" 
              className={`fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 ${
                isBotSpeaking 
                  ? 'animate-pulse shadow-glow bg-gradient-to-r from-primary to-primary-glow scale-110' 
                  : 'animate-pulse-glow'
              }`}
              variant="connect"
            >
              <MessageCircle className={`h-6 w-6 ${isBotSpeaking ? 'animate-bounce' : ''}`} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-96 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className={isBotSpeaking ? 'animate-pulse text-primary' : ''}>
                Chat Console {isBotSpeaking && '🗣️'}
              </SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100vh-80px)]">
              <ChatConsole isConnected={isConnected} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Click connect to start your AI-powered video call experience</p>
          <p className={`text-xs mt-1 transition-all duration-300 ${
            isBotSpeaking ? 'text-primary animate-pulse font-medium' : 'opacity-60'
          }`}>
            {isBotSpeaking ? '🤖 AI is speaking...' : 'Interface will pulse when AI is speaking'}
          </p>
        </div>

        {/* Background Overlay Effect when Bot is Speaking */}
        {isBotSpeaking && (
          <div className="fixed inset-0 pointer-events-none z-10">
            <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-pulse"></div>
          </div>
        )}
      </div>

      {/* Custom CSS for enhanced pulsing effects */}
      <style>{`
        @keyframes gentle-pulse {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.02);
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
          }
          50% {
            box-shadow: 0 0 40px hsl(var(--primary) / 0.6);
          }
        }
        
        .animate-gentle-pulse {
          animation: gentle-pulse 2s ease-in-out infinite;
        }
        
        .animate-glow-pulse {
          animation: glow-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}