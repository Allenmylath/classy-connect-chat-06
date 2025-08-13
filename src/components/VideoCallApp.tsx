import { useState } from "react";
import { StartupForm } from "./StartupForm";
import { ChatConsole } from "./ChatConsole";
import { ConnectionButton } from "./ConnectionButton";

export function VideoCallApp() {
  const [isConnected, setIsConnected] = useState(false);
  
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
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100vh-200px)]">
          {/* Form Section */}
          <div className="h-1/2 lg:h-full lg:flex-1">
            <StartupForm isConnected={isConnected} />
          </div>

          {/* Chat Section */}
          <div className="h-1/2 lg:h-full lg:w-96">
            <ChatConsole isConnected={isConnected} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Click connect to start your AI-powered video call experience</p>
        </div>
      </div>
    </div>
  );
}