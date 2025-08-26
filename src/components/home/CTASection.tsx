"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Users, Zap, Palette, TrendingUp } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";
import { WaitlistForm } from "@/components/forms/waitlist-form";
import { Annonce } from "@/components/ui/Annonce";

export function CTASection() {
  const analytics = useAnalytics();
  const logger = useLogger({ context: "CTASection" });

  const handleWaitlistInterest = () => {
    try {
      analytics.trackUserAction("waitlist_interest", "engagement", "scroll_to_signup");
      logger.info("User showed interest in waitlist");
      // Smooth scroll to waitlist form
      const waitlistForm = document.getElementById('waitlist-signup');
      waitlistForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
      logger.error("Failed to handle waitlist interest", error);
      analytics.trackError(error as Error);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-small-black/[0.2] bg-grid-small-white/[0.2] dark:bg-grid-small-white/[0.2]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[40rem] w-[40rem] rounded-full bg-gradient-radial from-primary/20 to-transparent blur-3xl" />
      </div>
      
      <div className="relative py-16 lg:py-20">
        <div className="container mx-auto px-4">
          {/* Hero Section - Creative Platform Vision */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              {/* <Annonce /> */}
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Beta Access
              </div>
            </div>
            
            <h1 className="font-sans text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl mb-6">
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                SASASASA
              </span>
            </h1>
            
            <div className="max-w-4xl mx-auto space-y-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground/90 mb-4">
                Take Control, Scale Your Creative Empire 🎨
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
                All-in-one platform for creatives to sell products, host premium experiences, and grow their brand. 
                <span className="font-medium text-foreground"> Lower fees, fewer barriers, more freedom.</span>
              </p>

              {/* Creative-focused value props */}
              <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Palette className="h-4 w-4 text-primary" />
                  <span>Create & Collaborate</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Scale Revenue</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Understand Your Audience</span>
                </div>
              </div>
            </div>

            {/* Social Proof & Urgency */}
            <div className="flex items-center justify-center gap-8 mt-2 text-sm text-muted-foreground">
              {/* <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>1,247+ creators</span>
              </div> */}
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Open Beta Season</span>
              </div>
            </div>
          </div>

          {/* Primary CTA - Newsletter Signup */}
          <div className="max-w-lg mx-auto mb-10">
            <div 
              id="waitlist-signup"
              className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-xl"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Get exclusive early access and discounts, join our newsletter 😉</h3>
                <p className="text-muted-foreground text-sm">
                  ✨
                </p>
              </div>
              
              <WaitlistForm />
            </div>
          </div>

          {/* Trust Signals */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted-foreground/70 max-w-md mx-auto">
              🔒 We respect your privacy. Unsubscribe anytime. 
              <br />
              Join the platform that's for creative entrepreneurs worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
