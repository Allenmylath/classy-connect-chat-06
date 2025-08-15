import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePipecatClient, useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";

interface StartupFormProps {
  isConnected: boolean;
}

type FormField = "name" | "email" | "experience";

interface FormFieldConfig {
  field: FormField;
  label?: string;
  placeholder?: string;
  required?: boolean;
  validation_error?: string;
}

interface ServerFormMessage {
  type: "form_control";
  action: "show_field" | "submit_form" | "reset_form";
  field?: FormField;
  label?: string;
  placeholder?: string;
  required?: boolean;
  validation_error?: string;
}

export function StartupForm({ isConnected }: StartupFormProps) {
  const { toast } = useToast();
  const pipecatClient = usePipecatClient();
  
  // Default to showing name field
  const [currentField, setCurrentField] = useState<FormField>("name");
  const [fieldConfig, setFieldConfig] = useState<FormFieldConfig>({
    field: "name",
    label: "What's your name?",
    placeholder: "Enter your full name",
    required: true
  });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    experience: ""
  });
  
  const [validationError, setValidationError] = useState<string>("");

  // Listen to server messages for form control
  useRTVIClientEvent(
    RTVIEvent.ServerMessage,
    useCallback((data: any) => {
      console.log("📨 Server message received:", data);
      
      // Check if this is a form control message
      if (data?.type === "form_control") {
        const formMessage = data as ServerFormMessage;
        
        switch (formMessage.action) {
          case "show_field":
            if (formMessage.field) {
              console.log(`🔄 Switching to field: ${formMessage.field}`);
              setCurrentField(formMessage.field);
              setFieldConfig({
                field: formMessage.field,
                label: formMessage.label || getDefaultLabel(formMessage.field),
                placeholder: formMessage.placeholder || getDefaultPlaceholder(formMessage.field),
                required: formMessage.required ?? true
              });
              
              // Set validation error if provided
              if (formMessage.validation_error) {
                setValidationError(formMessage.validation_error);
              } else {
                setValidationError("");
              }
            }
            break;
            
          case "submit_form":
            console.log("📤 Server requested form submission");
            handleServerSubmit();
            break;
            
          case "reset_form":
            console.log("🔄 Server requested form reset");
            handleReset();
            break;
        }
      }
    }, [])
  );

  const getDefaultLabel = (field: FormField): string => {
    switch (field) {
      case "name": return "What's your name?";
      case "email": return "What's your email?";
      case "experience": return "Tell us about your startup";
      default: return "Please provide information";
    }
  };

  const getDefaultPlaceholder = (field: FormField): string => {
    switch (field) {
      case "name": return "Enter your full name";
      case "email": return "Enter your email address";
      case "experience": return "Tell us about your current startup, role, challenges, and what you're looking to achieve...";
      default: return "";
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }
  };

  const sendFieldData = (field: FormField, value: string) => {
    if (!isConnected || !pipecatClient) return;
    
    console.log(`📤 Sending ${field} data:`, value);
    
    // Send the field data to the bot
    pipecatClient.sendClientMessage("form_field_data", {
      field: field,
      value: value,
      timestamp: new Date().toISOString()
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentValue = formData[currentField];
    
    if (!currentValue.trim()) {
      setValidationError(`${fieldConfig.label?.replace('?', '')} is required`);
      return;
    }
    
    // Send current field data
    sendFieldData(currentField, currentValue.trim());
  };

  const handleServerSubmit = () => {
    if (!isConnected || !pipecatClient) return;
    
    // Send complete form data
    pipecatClient.sendClientMessage("form_complete", {
      data: formData,
      timestamp: new Date().toISOString()
    });
    
    toast({
      title: "Form submitted successfully!",
      description: "Thank you for sharing your startup information with us."
    });
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      experience: ""
    });
    setCurrentField("name");
    setValidationError("");
    setFieldConfig({
      field: "name",
      label: "What's your name?",
      placeholder: "Enter your full name",
      required: true
    });
  };

  const canSubmit = () => {
    const currentValue = formData[currentField];
    return isConnected && currentValue.trim() !== "";
  };

  const renderField = () => {
    const currentValue = formData[currentField];
    
    switch (currentField) {
      case "name":
        return (
          <div className="space-y-2">
            <Label htmlFor="name">{fieldConfig.label}</Label>
            <Input
              id="name"
              type="text"
              placeholder={fieldConfig.placeholder}
              value={currentValue}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
        );
        
      case "email":
        return (
          <div className="space-y-2">
            <Label htmlFor="email">{fieldConfig.label}</Label>
            <Input
              id="email"
              type="email"
              placeholder={fieldConfig.placeholder}
              value={currentValue}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
        );
        
      case "experience":
        return (
          <div className="space-y-2 flex-1">
            <Label htmlFor="experience">{fieldConfig.label}</Label>
            <Textarea
              id="experience"
              placeholder={fieldConfig.placeholder}
              value={currentValue}
              onChange={(e) => handleChange("experience", e.target.value)}
              className="w-full h-32 resize-none"
              autoFocus
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="flex-1 bg-gradient-card border-border/50 shadow-card p-6">
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{fieldConfig.label}</h2>
          <p className="text-muted-foreground">
            Currently showing: {currentField} field
          </p>
          {!isConnected && (
            <p className="text-sm text-yellow-600 mt-2">
              Connect to enable AI-driven form interaction
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
          {renderField()}
          
          {validationError && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              {validationError}
            </div>
          )}

          <div className="flex gap-3 mt-auto">
            <Button 
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1"
            >
              Reset Form
            </Button>
            
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!canSubmit()}
            >
              Send {currentField.charAt(0).toUpperCase() + currentField.slice(1)}
            </Button>
          </div>
          
          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">
              Please connect to interact with the AI form assistant
            </p>
          )}
        </form>

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs">
            <p><strong>Current Field:</strong> {currentField}</p>
            <p><strong>Form Data:</strong> {JSON.stringify(formData, null, 2)}</p>
            <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </Card>
  );
}