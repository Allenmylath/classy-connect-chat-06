import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface StartupFormProps {
  isConnected: boolean;
}

type FormStep = "name" | "email" | "experience";

export function StartupForm({ isConnected }: StartupFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<FormStep>("name");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    experience: ""
  });

  const handleNext = () => {
    if (currentStep === "name" && formData.name.trim()) {
      setCurrentStep("email");
    } else if (currentStep === "email" && formData.email.trim()) {
      setCurrentStep("experience");
    }
  };

  const handleBack = () => {
    if (currentStep === "email") {
      setCurrentStep("name");
    } else if (currentStep === "experience") {
      setCurrentStep("email");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.experience) {
      toast({
        title: "Please fill in all fields",
        description: "All fields are required to submit the form.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Form submitted successfully!",
      description: "Thank you for sharing your startup experience with us."
    });
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      experience: ""
    });
    setCurrentStep("name");
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "name": return "What's your name?";
      case "email": return "What's your email?";
      case "experience": return "Tell us about your startup";
      default: return "Tell Us About Yourself";
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "name": return formData.name.trim() !== "";
      case "email": return formData.email.trim() !== "";
      case "experience": return formData.experience.trim() !== "";
      default: return false;
    }
  };

  return (
    <Card className="flex-1 bg-gradient-card border-border/50 shadow-card p-6">
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{getStepTitle()}</h2>
          <p className="text-muted-foreground">
            Step {currentStep === "name" ? "1" : currentStep === "email" ? "2" : "3"} of 3
          </p>
        </div>

        <form onSubmit={currentStep === "experience" ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="flex-1 flex flex-col gap-6">
          {currentStep === "name" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
          )}

          {currentStep === "email" && (
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
          )}

          {currentStep === "experience" && (
            <div className="space-y-2 flex-1">
              <Label htmlFor="experience">Current Startup Experience</Label>
              <Textarea
                id="experience"
                placeholder="Tell us about your current startup, role, challenges, and what you're looking to achieve..."
                value={formData.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
                className="w-full h-32 resize-none"
                autoFocus
              />
            </div>
          )}

          <div className="flex gap-3 mt-auto">
            {currentStep !== "name" && (
              <Button 
                type="button"
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                Back
              </Button>
            )}
            
            <Button 
              type="submit" 
              className="flex-1"
              disabled={!isConnected || !canProceed()}
            >
              {currentStep === "experience" ? "Submit Information" : "Next"}
            </Button>
          </div>
          
          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">
              Please connect to submit your information
            </p>
          )}
        </form>
      </div>
    </Card>
  );
}