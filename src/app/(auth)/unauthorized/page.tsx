import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-center">Access Denied</CardTitle>
          <CardDescription className="text-center">
            You don&apos;t have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-gray-600">
          <p>
            Please contact your administrator if you believe this is a mistake.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
