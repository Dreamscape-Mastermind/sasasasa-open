import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, AlertTriangle, XCircle, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export type KycStatus = "Verified" | "Pending" | "Needs Update" | "Rejected";

interface ProfileStatusCardProps {
  status: KycStatus;
  userName: string;
  lastUpdated?: string;
  isLoading: boolean;
}

const statusConfig = {
  Verified: {
    icon: CheckCircle,
    label: "Verified",
    variant: "default" as const,
    bgColor: "bg-green-500",
    description: "Your profile is verified and ready for payouts"
  },
  Pending: {
    icon: Clock,
    label: "Pending Review",
    variant: "secondary" as const,
    bgColor: "bg-gray-500",
    description: "Your documents are being reviewed"
  },
  "Needs Update": {
    icon: AlertTriangle,
    label: "Needs Update",
    variant: "destructive" as const,
    bgColor: "bg-yellow-500",
    description: "Please update your information to continue"
  },
  Rejected: {
    icon: XCircle,
    label: "Rejected",
    variant: "destructive" as const,
    bgColor: "bg-red-500",
    description: "Your verification was not approved"
  }
};

export function ProfileStatusCard({ status, userName, lastUpdated, isLoading }: ProfileStatusCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border/50 shadow-card">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

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
                Last updated: {new Date(lastUpdated).toLocaleDateString()}
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