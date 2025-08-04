import { Shield, ChevronRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-trust-primary to-trust-secondary rounded-full flex items-center justify-center mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-trust-primary to-trust-secondary bg-clip-text">
            Secure Identity Verification
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Complete your KYC verification to unlock full access to our platform. Fast, secure, and compliant with industry standards.
          </p>
          <Link href="/dashboard/kyc">
            <Button variant="default" size="lg" className="group">
              Start KYC Verification
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="shadow-card border-0 hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-trust-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-trust-primary" />
              </div>
              <CardTitle className="text-lg">Quick & Easy</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Complete verification in just 3 simple steps. Takes less than 5 minutes.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-trust-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-trust-primary" />
              </div>
              <CardTitle className="text-lg">Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Your data is encrypted and protected with bank-level security standards.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-trust-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-trust-primary" />
              </div>
              <CardTitle className="text-lg">Fast Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get verified within 24-48 hours and access all platform features.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;