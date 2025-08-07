"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles, Zap, Users, Instagram } from "lucide-react";

interface BetaProgramPopupProps {
  children: React.ReactNode;
}

export default function BetaProgramPopup({ children }: BetaProgramPopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMailtoClick = () => {
    const subject = encodeURIComponent("Beta Program Access Request");
    const body = encodeURIComponent(
      `Hi Sasasasa Team,

I'm interested in joining your beta program to unlock paid ticketing features.

Please let me know how I can get access to:
- Paid ticket creation and management
- Advanced pricing options
- Revenue tracking and analytics
- Priority support

Looking forward to hearing from you!

Best regards,
[Your Name]`
    );
    
    window.location.href = `mailto:beta@sasasasa.co?subject=${subject}&body=${body}`;
  };

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/sasasasa_official', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#CC322D]/10">
            <Sparkles className="h-8 w-8 text-[#CC322D]" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Join Our Beta Program
          </DialogTitle>
          <DialogDescription className="text-base text-center text-muted-foreground">
            Be among the first to experience premium ticketing features and help shape the future of event management
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Beta Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-center">What You'll Get:</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#CC322D]/10 rounded-full flex items-center justify-center">
                    <Zap className="h-5 w-5 text-[#CC322D]" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-base">Paid Ticketing</p>
                  <p className="text-sm text-muted-foreground">
                    Create and sell paid tickets with flexible pricing options
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#CC322D]/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#CC322D]" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-base">Advanced Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Track sales, revenue, and get detailed attendee insights
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-[#CC322D]/10 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#CC322D]" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-base">Priority Access</p>
                  <p className="text-sm text-muted-foreground">
                    Direct access to our development team for personalized help and first access to new features
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Ready to get started? Choose your preferred way to reach out:
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handleMailtoClick}
                className="w-full h-12 text-base font-medium"
              >
                <Mail className="h-5 w-5" />
                Send email to beta@sasasasa.co
              </Button>
              
              <Button 
                onClick={handleInstagramClick}
                variant="outline"
                className="w-full h-12 text-base font-medium"
              >
                <Instagram className="h-5 w-5" />
                Send us a message on Instagram
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Beta access is completely free and includes all premium features during the beta period
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 