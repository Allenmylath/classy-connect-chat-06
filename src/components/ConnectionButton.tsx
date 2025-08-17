import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { usePipecatClient, useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent, TransportState } from "@pipecat-ai/client-js";
import { useToast } from "@/hooks/use-toast";

interface ConnectionButtonProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export function ConnectionButton({
  onConnectionChange
}: ConnectionButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [transportState, setTransportState] = useState<TransportState>("disconnected");
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const {
    toast
  } = useToast();
  const pipecatClient = usePipecatClient();

  // Helper function to determine if we're in a "connected" state
  const isConnectedState = (state: TransportState): boolean => {
    return state === "connected" || state === "ready";
  };

  // Detailed logging helper
  const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [ConnectionButton]`;
    
    switch (level) {
      case 'info':
        console.log(`${prefix} ℹ️ ${message}`, data || '');
        break;
      case 'warn':
        console.warn(`${prefix} ⚠️ ${message}`, data || '');
        break;
      case 'error':
        console.error(`${prefix} ❌ ${message}`, data || '');
        break;
    }
  };

  // Listen to transport state changes
  useRTVIClientEvent(RTVIEvent.TransportStateChanged, useCallback((state: TransportState) => {
    log('info', `Transport state changed: ${state}`);
    setTransportState(state);

    // Reset connecting state when we reach a final state
    if (state === "connected" || state === "ready" || state === "disconnected" || state === "error") {
      log('info', `Setting isConnecting to false due to state: ${state}`);
      setIsConnecting(false);
    }

    // ✅ FIX: Consider both "connected" AND "ready" as connected
    const connected = isConnectedState(state);
    log('info', `Connection status: ${connected ? 'CONNECTED' : 'DISCONNECTED'}`);

    // Notify parent component of connection changes
    if (onConnectionChange) {
      onConnectionChange(connected);
    }

    // Show appropriate toasts
    if (state === "connected") {
      log('info', 'Successfully connected to transport');
      toast({
        title: "Connected!",
        description: "You are now connected to the video call."
      });
    } else if (state === "ready") {
      log('info', 'Bot is ready for interaction');
      toast({
        title: "Ready!",
        description: "Bot is ready for conversation."
      });
    } else if (state === "disconnected") {
      log('warn', 'Disconnected from transport');
      toast({
        title: "Disconnected",
        description: "You have been disconnected from the call.",
        variant: "destructive"
      });
    } else if (state === "error") {
      log('error', 'Transport error occurred');
      toast({
        title: "Connection Error",
        description: "Failed to connect to the call. Please try again.",
        variant: "destructive"
      });
    }
  }, [onConnectionChange, toast]));

  // Listen to bot ready event
  useRTVIClientEvent(RTVIEvent.BotReady, useCallback(() => {
    log('info', 'Bot ready event received');
    toast({
      title: "Bot Ready",
      description: "The AI assistant is now ready to chat."
    });
  }, [toast]));

  // Listen to client ready event  
  useRTVIClientEvent(RTVIEvent.Connected, useCallback(() => {
    log('info', 'Client connected event received');
  }, []));

  // Listen to error events
  useRTVIClientEvent(RTVIEvent.Error, useCallback((error: any) => {
    log('error', 'RTVI Error event received', error);
    toast({
      title: "RTVI Error",
      description: `Error: ${error?.message || 'Unknown error occurred'}`,
      variant: "destructive"
    });
  }, [toast]));

  const testEndpoint = async (url: string) => {
    try {
      log('info', `Testing endpoint: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      log('info', `Endpoint test response:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        const data = await response.json();
        log('info', 'Endpoint test successful', data);
        return true;
      } else {
        const errorText = await response.text();
        log('error', `Endpoint test failed: ${response.status} ${response.statusText}`, errorText);
        return false;
      }
    } catch (error) {
      log('error', 'Endpoint test threw exception', error);
      return false;
    }
  };

  const testConnectEndpoint = async (url: string, requestData: any) => {
    try {
      log('info', `Testing connect endpoint: ${url}`, requestData);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      log('info', `Connect endpoint response:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        const data = await response.json();
        log('info', 'Connect endpoint test successful', data);
        return { success: true, data };
      } else {
        const errorText = await response.text();
        log('error', `Connect endpoint test failed: ${response.status} ${response.statusText}`, errorText);
        return { success: false, error: errorText, status: response.status };
      }
    } catch (error) {
      log('error', 'Connect endpoint test threw exception', error);
      return { success: false, error: error.message };
    }
  };

  const handleConnect = async () => {
    try {
      const attemptNumber = connectionAttempts + 1;
      setConnectionAttempts(attemptNumber);
      setIsConnecting(true);
      
      log('info', `🚀 Starting connection attempt #${attemptNumber}`);
      
      // Validate environment and client
      if (!pipecatClient) {
        throw new Error("Pipecat client is not available");
      }
      
      const baseUrl = import.meta.env.VITE_PIPECAT_API_URL || "https://manjujayamurali--superbryn-form-bot-fastapi-app.modal.run";
      const healthUrl = `${baseUrl}/`;
      const connectUrl = `${baseUrl}/connect`;
      
      log('info', 'Environment check', {
        baseUrl,
        healthUrl,
        connectUrl,
        clientAvailable: !!pipecatClient
      });

      // Step 1: Test health endpoint
      log('info', '📋 Step 1: Testing health endpoint...');
      const healthCheck = await testEndpoint(healthUrl);
      
      if (!healthCheck) {
        throw new Error("Health check failed - server may be unavailable");
      }
      
      // Step 2: Test connect endpoint
      log('info', '🔗 Step 2: Testing connect endpoint...');
      const requestData = {
        services: {
          llm: "openai",
          tts: "cartesia"
        }
      };
      
      const connectTest = await testConnectEndpoint(connectUrl, requestData);
      
      if (!connectTest.success) {
        throw new Error(`Connect endpoint failed: ${connectTest.error} (Status: ${connectTest.status})`);
      }
      
      // Step 3: Attempt Pipecat connection
      log('info', '🎯 Step 3: Initiating Pipecat client connection...');
      
      const connectionConfig = {
        endpoint: connectUrl,
        requestData
      };
      
      log('info', 'Connection config', connectionConfig);
      
      await pipecatClient.connect(connectionConfig);
      
      log('info', '✅ Pipecat connection initiated successfully');
      
    } catch (error) {
      log('error', 'Connection failed with error', {
        message: error.message,
        stack: error.stack,
        attempt: connectionAttempts + 1
      });
      
      setIsConnecting(false);
      
      let errorMessage = "Unknown connection error";
      let errorDescription = "Please check your network and try again.";
      
      if (error.message.includes("Health check failed")) {
        errorMessage = "Server Unavailable";
        errorDescription = "The bot server is not responding. Please try again in a moment.";
      } else if (error.message.includes("Connect endpoint failed")) {
        errorMessage = "Connection Endpoint Error";
        errorDescription = error.message;
      } else if (error.message.includes("not available")) {
        errorMessage = "Client Error";
        errorDescription = "Pipecat client initialization failed. Please refresh the page.";
      } else {
        errorMessage = "Connection Failed";
        errorDescription = `${error.message}`;
      }
      
      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      log('info', '🔌 Initiating disconnect...');
      
      if (!pipecatClient) {
        log('warn', 'No pipecat client available for disconnect');
        return;
      }
      
      await pipecatClient.disconnect();
      log('info', '✅ Disconnect successful');
      
      toast({
        title: "Call ended",
        description: "You have disconnected from the call.",
        variant: "destructive"
      });
    } catch (error) {
      log('error', 'Disconnect failed', error);
      toast({
        title: "Disconnect Error",
        description: "Error while disconnecting. Please refresh the page.",
        variant: "destructive"
      });
    }
  };

  const handleToggleConnection = () => {
    const connected = isConnectedState(transportState);
    log('info', `Toggle connection - currently ${connected ? 'connected' : 'disconnected'}`);
    
    if (connected) {
      handleDisconnect();
    } else {
      handleConnect();
    }
  };

  const connected = isConnectedState(transportState);
  const isConnectingOrInitializing = transportState === "connecting" || 
                                    transportState === "initializing" || 
                                    transportState === "initialized" || 
                                    transportState === "authenticating" || 
                                    transportState === "authenticated";
  const isDisabled = isConnecting || isConnectingOrInitializing;

  // Status display helper
  const getStatusDisplay = () => {
    if (isConnecting) return "Connecting...";
    if (isConnectingOrInitializing) return `${transportState}...`;
    return transportState;
  };

  const getStatusColor = () => {
    if (connected) return "text-green-600";
    if (transportState === "error") return "text-red-600";
    if (isConnectingOrInitializing || isConnecting) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button 
        onClick={handleToggleConnection} 
        disabled={isDisabled} 
        variant={connected ? "disconnect" : "connect"} 
        size="default" 
        className="px-4 py-2 text-sm font-medium rounded-full shadow-elegant hover:shadow-glow transition-all duration-300 min-w-[120px]"
      >
        {isDisabled ? (
          <>
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {transportState === "connecting" ? "Connecting..." : 
             transportState === "ready" ? "Getting Ready..." : 
             "Initializing..."}
          </>
        ) : connected ? (
          <>
            <PhoneOff size={20} />
            Disconnect
          </>
        ) : (
          <>
            <Phone size={20} />
            Connect
          </>
        )}
      </Button>
      
      <div className="text-center">
        <p className={`text-xs font-medium ${getStatusColor()}`}>
          Status: {getStatusDisplay()}
        </p>
        {connectionAttempts > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Attempts: {connectionAttempts}
          </p>
        )}
      </div>

      {/* Debug Panel - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs max-w-sm">
          <details>
            <summary className="cursor-pointer font-medium mb-2">Debug Info</summary>
            <div className="space-y-1">
              <p><strong>Transport State:</strong> {transportState}</p>
              <p><strong>Is Connecting:</strong> {isConnecting ? 'Yes' : 'No'}</p>
              <p><strong>Is Connected:</strong> {connected ? 'Yes' : 'No'}</p>
              <p><strong>Client Available:</strong> {pipecatClient ? 'Yes' : 'No'}</p>
              <p><strong>Connection Attempts:</strong> {connectionAttempts}</p>
              <p><strong>Base URL:</strong> {import.meta.env.VITE_PIPECAT_API_URL || "default"}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}