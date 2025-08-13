import { Card } from "@/components/ui/card";
import { Video, VideoOff, Mic, MicOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePipecatClientCamControl, usePipecatClientMicControl, usePipecatClientMediaDevices, PipecatClientVideo } from "@pipecat-ai/client-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
interface VideoConsoleProps {
  isConnected: boolean;
}
export function VideoConsole({
  isConnected
}: VideoConsoleProps) {
  const {
    toast
  } = useToast();

  // Pipecat camera controls
  const {
    enableCam,
    isCamEnabled
  } = usePipecatClientCamControl();

  // Pipecat microphone controls
  const {
    enableMic,
    isMicEnabled
  } = usePipecatClientMicControl();

  // Media device management
  const {
    availableCams,
    availableMics,
    selectedCam,
    selectedMic,
    updateCam,
    updateMic
  } = usePipecatClientMediaDevices();

  // Settings dropdown state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Handle outside click for settings dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);
  const handleToggleCamera = async () => {
    try {
      const newState = !isCamEnabled;
      await enableCam(newState);
      toast({
        title: newState ? "Camera enabled" : "Camera disabled",
        description: `Video is now ${newState ? "on" : "off"}.`
      });
    } catch (error) {
      console.error("Failed to toggle camera:", error);
      toast({
        title: "Camera Error",
        description: "Failed to toggle camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  const handleToggleMicrophone = async () => {
    try {
      const newState = !isMicEnabled;
      await enableMic(newState);
      toast({
        title: newState ? "Microphone enabled" : "Microphone disabled",
        description: `Microphone is now ${newState ? "on" : "off"}.`
      });
    } catch (error) {
      console.error("Failed to toggle microphone:", error);
      toast({
        title: "Microphone Error",
        description: "Failed to toggle microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  const handleCameraChange = async (deviceId: string) => {
    try {
      await updateCam(deviceId);
      toast({
        title: "Camera switched",
        description: "Camera device has been changed."
      });
    } catch (error) {
      console.error("Failed to switch camera:", error);
      toast({
        title: "Camera Error",
        description: "Failed to switch camera device.",
        variant: "destructive"
      });
    }
  };
  const handleMicrophoneChange = async (deviceId: string) => {
    try {
      await updateMic(deviceId);
      toast({
        title: "Microphone switched",
        description: "Microphone device has been changed."
      });
    } catch (error) {
      console.error("Failed to switch microphone:", error);
      toast({
        title: "Microphone Error",
        description: "Failed to switch microphone device.",
        variant: "destructive"
      });
    }
  };
  return <Card className="relative flex-1 bg-gradient-card border-border/50 shadow-card overflow-hidden">
      {/* Video Area */}
      <div className="aspect-video bg-muted/50 flex items-center justify-center relative border border-border/30">
        
        {/* Local Video (User's camera) */}
        {isConnected && isCamEnabled ? <div className="relative w-full h-full">
            <PipecatClientVideo participant="local" fit="cover" mirror={true} className="w-full h-full object-cover" onResize={({
          aspectRatio,
          height,
          width
        }) => {
          console.log("Local video dimensions:", {
            aspectRatio,
            height,
            width
          });
        }} />
            
            {/* Small overlay showing it's the local video */}
            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              You
            </div>
          </div> : <div className="flex flex-col items-center gap-4 text-muted-foreground">
            {!isConnected ? <>
                <Video size={64} />
                
              </> : <>
                <VideoOff size={64} />
                <p className="text-lg">Camera is off</p>
                <p className="text-sm">Click the camera button to enable video</p>
              </>}
          </div>}
        
        {/* Connection Status Indicator */}
        {isConnected && <div className="absolute top-4 right-4 flex items-center gap-2 bg-success/20 backdrop-blur-sm px-3 py-1 rounded-full border border-success/30">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow" />
            <span className="text-success text-sm font-medium">Connected</span>
          </div>}

        {/* Media Device Status */}
        <div className="absolute top-4 left-4 flex flex-col gap-1">
          {selectedCam && <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
              📹 {selectedCam.label || "Camera"}
            </div>}
          {selectedMic && <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
              🎤 {selectedMic.label || "Microphone"}
            </div>}
        </div>
      </div>
      
      {/* Video Controls */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
        
        {/* Microphone Toggle */}
        <Button variant="ghost" size="icon" onClick={handleToggleMicrophone} disabled={!isConnected} className={`rounded-full transition-all duration-300 ${!isMicEnabled ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' : 'hover:bg-primary/20 text-foreground'}`} title={isMicEnabled ? "Mute microphone" : "Unmute microphone"}>
          {isMicEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </Button>
        
        {/* Camera Toggle */}
        <Button variant="ghost" size="icon" onClick={handleToggleCamera} disabled={!isConnected} className={`rounded-full transition-all duration-300 ${!isCamEnabled ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' : 'hover:bg-primary/20 text-foreground'}`} title={isCamEnabled ? "Turn off camera" : "Turn on camera"}>
          {isCamEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </Button>
        
        {/* Settings/Device Selector */}
        <div className="relative" ref={settingsRef}>
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={!isConnected} 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="rounded-full hover:bg-primary/20 text-foreground transition-all duration-300" 
            title="Media settings"
          >
            <Settings size={20} />
          </Button>
          
          {/* Device Selection Dropdown */}
          {isConnected && isSettingsOpen && <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-lg p-3 shadow-lg z-50 min-w-48">
              
              {/* Camera Selection */}
              {availableCams.length > 0 && <div className="mb-3">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Camera
                  </label>
                  <select value={selectedCam?.deviceId || ""} onChange={e => handleCameraChange(e.target.value)} className="w-full text-xs bg-background border border-border rounded px-2 py-1">
                    {availableCams.map(cam => <option key={cam.deviceId} value={cam.deviceId}>
                        {cam.label || `Camera ${cam.deviceId.slice(0, 8)}`}
                      </option>)}
                  </select>
                </div>}
              
              {/* Microphone Selection */}
              {availableMics.length > 0 && <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Microphone
                  </label>
                  <select value={selectedMic?.deviceId || ""} onChange={e => handleMicrophoneChange(e.target.value)} className="w-full text-xs bg-background border border-border rounded px-2 py-1">
                    {availableMics.map(mic => <option key={mic.deviceId} value={mic.deviceId}>
                        {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                      </option>)}
                  </select>
                </div>}
              
              {availableCams.length === 0 && availableMics.length === 0 && <p className="text-xs text-muted-foreground">No devices available</p>}
            </div>}
        </div>
      </div>

      {/* Device Status Bar */}
      {isConnected && <div className="absolute top-2 left-2 flex gap-1">
          <div className={`w-2 h-2 rounded-full ${isMicEnabled ? 'bg-success' : 'bg-destructive'}`} title={`Microphone ${isMicEnabled ? 'enabled' : 'disabled'}`} />
          <div className={`w-2 h-2 rounded-full ${isCamEnabled ? 'bg-success' : 'bg-destructive'}`} title={`Camera ${isCamEnabled ? 'enabled' : 'disabled'}`} />
        </div>}
    </Card>;
}