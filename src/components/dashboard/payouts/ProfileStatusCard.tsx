import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle, XCircle, User } from "lucide-react";

export type KycStatus = "verified" | "pending" | "needs_update" | "rejected";

interface ProfileStatusCardProps {
  status: KycStatus;
  userName: string;
  lastUpdated?: string;
}

const statusConfig = {
  verified: {
    icon: CheckCircle,
    label: "Verified",
    variant: "default" as const,
    bgColor: "bg-gradient-success",
    description: "Your profile is verified and ready for payouts"
  },
  pending: {
    icon: Clock,
    label: "Pending Review",
    variant: "secondary" as const,
    bgColor: "bg-gradient-primary",
    description: "Your documents are being reviewed"
  },
  needs_update: {
    icon: AlertTriangle,
    label: "Needs Update",
    variant: "destructive" as const,
    bgColor: "bg-gradient-warning",
    description: "Please update your information to continue"
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    variant: "destructive" as const,
    bgColor: "bg-destructive",
    description: "Your verification was not approved"
  }
};

export function ProfileStatusCard({ status, userName, lastUpdated }: ProfileStatusCardProps) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Profile Status</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">{userName}</h3>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground">
                Last updated: {lastUpdated}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${config.bgColor}`}>
            <StatusIcon className="h-6 w-6 text-white" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge 
            variant={config.variant}
            className="text-sm font-medium"
          >
            {config.label}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {config.description}
        </p>
      </CardContent>
    </Card>
  );
}