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

export function StartupForm({ isConnected }: StartupFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    experience: ""
  });

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
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="flex-1 bg-gradient-card border-border/50 shadow-card p-6">
      <div className="h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Tell Us About Yourself</h2>
          <p className="text-muted-foreground">
            Share your startup journey and experience with our AI assistant
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2 flex-1">
            <Label htmlFor="experience">Current Startup Experience</Label>
            <Textarea
              id="experience"
              placeholder="Tell us about your current startup, role, challenges, and what you're looking to achieve..."
              value={formData.experience}
              onChange={(e) => handleChange("experience", e.target.value)}
              className="w-full h-32 resize-none"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={!isConnected}
          >
            Submit Information
          </Button>
          
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