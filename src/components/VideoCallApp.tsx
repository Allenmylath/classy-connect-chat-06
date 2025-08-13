import { useState } from "react";
import { StartupForm } from "./StartupForm";
import { ChatConsole } from "./ChatConsole";
import { ConnectionButton } from "./ConnectionButton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageCircle } from "lucide-react";

export function VideoCallApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
  };
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Jesicca ai Video bot
            </h1>
            <p className="text-muted-foreground">Next-generation AI video calling</p>
          </div>
          
          {/* Connection Button - Top Right */}
          <div className="flex-shrink-0">
            <ConnectionButton onConnectionChange={handleConnectionChange} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex justify-center h-[calc(100vh-200px)]">
          {/* Form Section - Full Width */}
          <div className="w-full max-w-2xl">
            <StartupForm isConnected={isConnected} />
          </div>
        </div>

        {/* Floating Chat Button */}
        <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-6 right-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 animate-pulse-glow"
              variant="connect"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-96 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Chat Console</SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100vh-80px)]">
              <ChatConsole isConnected={isConnected} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Click connect to start your AI-powered video call experience</p>
        </div>
      </div>
    </div>
  );
}