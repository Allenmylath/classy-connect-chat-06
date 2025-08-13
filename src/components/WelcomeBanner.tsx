import { useState } from "react";
import { X, Bot, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-gradient-card border shadow-elegant animate-scale-in">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Welcome to SuperBryn AI Form Assistant
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              This is an AI-powered form application that helps you create and manage forms intelligently.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-foreground">Chat with AI</p>
                  <p className="text-xs text-muted-foreground">Get intelligent assistance and suggestions</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-foreground">Direct Form Updates</p>
                  <p className="text-xs text-muted-foreground">Modify forms directly with AI help</p>
                </div>
              </div>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-sm text-destructive-foreground font-medium mb-1">
                ⚠️ Important Disclaimer
              </p>
              <p className="text-xs text-muted-foreground">
                AI can make errors. Please review and verify all details before submitting your forms.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                onClick={() => setIsVisible(false)}
                className="bg-gradient-button text-primary-foreground shadow-glow"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}