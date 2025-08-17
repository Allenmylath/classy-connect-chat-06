import { useState, useCallback, useEffect } from "react";
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
}

interface ServerFormMessage {
  type: "form_initialized";
  current_field: FormField;
  field_config: {
    label: string;
    placeholder: string;
    required: boolean;
  };
}

interface ServerResponseData {
  status?: "success" | "error" | "complete";
  field_id?: FormField;
  value?: string;
  next_field?: FormField | "complete";
  next_field_config?: {
    label: string;
    placeholder: string;
    required: boolean;
  };
  current_field_config?: {
    label: string;
    placeholder: string;
    required: boolean;
  };
  error?: string;
  validation_error?: string;
  message?: string;
  form_data?: Record<string, string>;
  current_field?: FormField;
}

export function StartupForm({ isConnected }: StartupFormProps) {
  const { toast } = useToast();
  const pipecatClient = usePipecatClient();
  
  // Form state
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formComplete, setFormComplete] = useState(false);

  // Listen to server messages for form initialization
  useRTVIClientEvent(
    RTVIEvent.ServerMessage,
    useCallback((data: any) => {
      console.log("📨 Server message received:", data);
      
      // Check if this is a form initialization message
      if (data?.type === "form_initialized") {
        const formMessage = data as ServerFormMessage;
        console.log(`🔄 Initializing form with field: ${formMessage.current_field}`);
        
        setCurrentField(formMessage.current_field);
        setFieldConfig({
          field: formMessage.current_field,
          label: formMessage.field_config.label,
          placeholder: formMessage.field_config.placeholder,
          required: formMessage.field_config.required
        });
        
        setValidationError("");
        setFormComplete(false);
      }
    }, [])
  );

  // Listen to server responses for form interactions
  useRTVIClientEvent(
    RTVIEvent.ServerResponse,
    useCallback((data: any) => {
      console.log("📨 Server response received:", data);
      setIsSubmitting(false);
      
      const responseData = data?.d as ServerResponseData;
      if (!responseData) return;

      if (responseData.status === "success") {
        // Clear any validation errors
        setValidationError("");
        
        // Handle successful field submission
        if (responseData.next_field === "complete") {
          setFormComplete(true);
          toast({
            title: "Form Complete!",
            description: "Thank you for sharing your startup information."
          });
        } else if (responseData.next_field && responseData.next_field_config) {
          // Move to next field
          setCurrentField(responseData.next_field);
          setFieldConfig({
            field: responseData.next_field,
            label: responseData.next_field_config.label,
            placeholder: responseData.next_field_config.placeholder,
            required: responseData.next_field_config.required
          });
          
          toast({
            title: "Field Updated!",
            description: `Now collecting: ${responseData.next_field_config.label}`,
          });
        }
        
      } else if (responseData.status === "error") {
        // Handle validation errors
        if (responseData.validation_error) {
          setValidationError(responseData.validation_error);
        }
        
        // Update field config if provided
        if (responseData.current_field_config) {
          setFieldConfig(prev => ({
            ...prev,
            label: responseData.current_field_config!.label,
            placeholder: responseData.current_field_config!.placeholder,
            required: responseData.current_field_config!.required
          }));
        }
        
        toast({
          title: "Validation Error",
          description: responseData.error || "Please check your input",
          variant: "destructive"
        });
        
      } else if (responseData.status === "complete") {
        setFormComplete(true);
        toast({
          title: "Form Submitted!",
          description: responseData.message || "Thank you for your submission."
        });
        
        // Log the final form data if provided
        if (responseData.form_data) {
          console.log("Final form data:", responseData.form_data);
        }
      }
    }, [toast])
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
    if (!isConnected || !pipecatClient) {
      toast({
        title: "Not Connected",
        description: "Please connect to submit form data",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`📤 Sending ${field} data:`, value);
    setIsSubmitting(true);
    
    // Send the field data to the bot using RTVI client messages
    pipecatClient.sendClientMessage("form_field_data", {
      field: field,
      value: value,
      timestamp: new Date().toISOString()
    }).catch((error) => {
      console.error("❌ Failed to send field data:", error);
      setIsSubmitting(false);
      toast({
        title: "Send Failed",
        description: "Failed to send data to server. Please try again.",
        variant: "destructive"
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formComplete) {
      toast({
        title: "Form Already Complete",
        description: "Your form has already been submitted successfully.",
      });
      return;
    }
    
    const currentValue = formData[currentField];
    
    if (!currentValue.trim()) {
      setValidationError(`${fieldConfig.label?.replace('?', '')} is required`);
      return;
    }
    
    // Send current field data
    sendFieldData(currentField, currentValue.trim());
  };

  const handleCompleteForm = () => {
    if (!isConnected || !pipecatClient) {
      toast({
        title: "Not Connected",
        description: "Please connect to complete the form",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Send complete form data
    pipecatClient.sendClientMessage("form_complete", {
      data: formData,
      timestamp: new Date().toISOString()
    }).catch((error) => {
      console.error("❌ Failed to complete form:", error);
      setIsSubmitting(false);
      toast({
        title: "Submission Failed",
        description: "Failed to submit form. Please try again.",
        variant: "destructive"
      });
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
    setFormComplete(false);
    setFieldConfig({
      field: "name",
      label: "What's your name?",
      placeholder: "Enter your full name",
      required: true
    });
    
    toast({
      title: "Form Reset",
      description: "Form has been reset to start over."
    });
  };

  const requestCurrentField = () => {
    if (!isConnected || !pipecatClient) return;
    
    pipecatClient.sendClientMessage("get_current_field", {
      timestamp: new Date().toISOString()
    }).catch((error) => {
      console.error("❌ Failed to get current field:", error);
    });
  };

  // Request current field info when connected
  useEffect(() => {
    if (isConnected) {
      // Small delay to ensure bot is ready
      const timer = setTimeout(() => {
        requestCurrentField();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  const canSubmit = () => {
    const currentValue = formData[currentField];
    return isConnected && currentValue.trim() !== "" && !isSubmitting && !formComplete;
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
              disabled={formComplete}
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
              disabled={formComplete}
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
              disabled={formComplete}
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
          <h2 className="text-2xl font-bold mb-2">
            {formComplete ? "Form Complete! 🎉" : fieldConfig.label}
          </h2>
          <p className="text-muted-foreground">
            {formComplete 
              ? "Thank you for sharing your startup information!"
              : `Currently collecting: ${currentField} field`
            }
          </p>
          {!isConnected && (
            <p className="text-sm text-yellow-600 mt-2">
              Connect to enable AI-driven form interaction
            </p>
          )}
          {isSubmitting && (
            <p className="text-sm text-blue-600 mt-2 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Processing your response...
            </p>
          )}
        </div>

        {formComplete ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                ✅ Submission Successful
              </h3>
              <p className="text-muted-foreground mb-4">
                Your startup information has been collected successfully.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 text-left">
                <h4 className="font-medium mb-2">Collected Information:</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {formData.name || "Not provided"}</p>
                  <p><strong>Email:</strong> {formData.email || "Not provided"}</p>
                  <p><strong>Experience:</strong> {formData.experience || "Not provided"}</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleReset}
              variant="outline"
              className="mt-4"
            >
              Start New Form
            </Button>
          </div>
        ) : (
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
                disabled={isSubmitting}
              >
                Reset Form
              </Button>
              
              {currentField === "experience" && formData.experience ? (
                <Button 
                  type="button"
                  onClick={handleCompleteForm}
                  className="flex-1"
                  disabled={!isConnected || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Complete Form"}
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={!canSubmit()}
                >
                  {isSubmitting 
                    ? "Sending..." 
                    : `Send ${currentField.charAt(0).toUpperCase() + currentField.slice(1)}`
                  }
                </Button>
              )}
            </div>
            
            {!isConnected && (
              <p className="text-sm text-muted-foreground text-center">
                Please connect to interact with the AI form assistant
              </p>
            )}
          </form>
        )}

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs">
            <p><strong>Current Field:</strong> {currentField}</p>
            <p><strong>Form Complete:</strong> {formComplete ? 'Yes' : 'No'}</p>
            <p><strong>Is Submitting:</strong> {isSubmitting ? 'Yes' : 'No'}</p>
            <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
            <p><strong>Form Data:</strong> {JSON.stringify(formData, null, 2)}</p>
          </div>
        )}
      </div>
    </Card>
  );
}