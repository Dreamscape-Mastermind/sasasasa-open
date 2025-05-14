"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs2";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import EmailSettings from "./EmailSettings";
import WalletSettings from "./WalletSettings";
import { motion } from 'framer-motion';
import { 
  Settings, 
  Mail, 
  Wallet, 
  Bell, 
  CreditCard, 
  Shield, 
  User, 
  Globe,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "contexts/AuthContext";
import { useEffect, useState } from "react";
import { Suspense } from 'react';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const searchParams = useSearchParams();
  const initTab = searchParams.get('tab') || 'account';
  const [tab, setTab] = useState(initTab);
  const action = searchParams.get('action');
  const { user } = useAuth();

  useEffect(() => {
    const currentTab = searchParams.get('tab');
    if (currentTab) {
      setTab(currentTab);
    }
  }, [searchParams]);

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };


  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      className="space-y-6 animate-in"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {(action === 'link-email' || user?.is_verified == false) && (
        <Alert variant="warning" className="bg-yellow-500/10 border-yellow-500/50">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Email Verification Required</AlertTitle>
          <AlertDescription>
            Please link your email address to enable all features. Add your email below to get a verification code.
          </AlertDescription>
        </Alert>
      )}
      <div>
        <motion.div 
          className="flex items-center gap-2 mb-2"
          variants={itemVariants}
        >
          <Settings className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </motion.div>
        <motion.p 
          className="text-muted-foreground"
          variants={itemVariants}
        >
          Manage your account settings and preferences
        </motion.p>
      </div>

      <Tabs 
        value={tab} 
        onValueChange={setTab}
        className="space-y-6"
      >
        <TabsList className="bg-background border">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your email and wallet connections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <EmailSettings />
                <WalletSettings />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  View your profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Name</Label>
                    <Input 
                      value={user?.first_name ? `${user.first_name} ${user.last_name}` : 'Not set'} 
                      className="bg-muted" 
                      disabled 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      value={user?.email || 'Not set'}
                      className="bg-muted"
                      disabled
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Bio</Label>
                    <Input 
                      value={user?.bio || 'Not set'} 
                      className="bg-muted" 
                      disabled 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  View your preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Time Zone</Label>
                      <p className="text-sm text-muted-foreground">
                        Your current time zone
                      </p>
                    </div>
                    <Select disabled defaultValue="eat">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eat">East Africa Time (EAT)</SelectItem>
                        <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                        <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                        <SelectItem value="cst">Central Time (CST)</SelectItem>
                        <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Currency</Label>
                      <p className="text-sm text-muted-foreground">
                        Your preferred currency
                      </p>
                    </div>
                    <Select disabled defaultValue="kes">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kes">KES (KSH)</SelectItem>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                        <SelectItem value="cad">CAD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  View your notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-center justify-between"
                    variants={itemVariants}
                  >
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications about your events
                      </p>
                    </div>
                    <Switch disabled defaultChecked />
                  </motion.div>
                  <Separator />
                  <motion.div 
                    className="flex items-center justify-between"
                    variants={itemVariants}
                  >
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications about your events
                      </p>
                    </div>
                    <Switch disabled defaultChecked />
                  </motion.div>
                  <Separator />
                  <motion.div 
                    className="flex items-center justify-between"
                    variants={itemVariants}
                  >
                    <div className="space-y-0.5">
                      <Label>Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about new features and promotions
                      </p>
                    </div>
                    <Switch disabled />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Billing Information
                </CardTitle>
                <CardDescription>
                  View your billing information and subscription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <motion.div 
                    className="grid gap-2"
                    variants={itemVariants}
                  >
                    <Label>Current Plan</Label>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/5">
                      <div>
                        <div className="font-medium">Standard Plan</div>
                        <div className="text-sm text-muted-foreground">
                          3.5%/transaction
                        </div>
                      </div>
                      <Button variant="outline" className="ml-4" disabled>
                        <span>Change Plan</span>
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                  <Separator />
                  <motion.div 
                    className="grid gap-2"
                    variants={itemVariants}
                  >
                    <Label>Payment Method</Label>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/5">
                      <div className="flex items-center gap-4">
                        <div className="font-medium">•••• XXXX</div>
                        <Badge variant="outline">Default</Badge>
                      </div>
                      <Button variant="ghost" disabled>Edit</Button>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  View your security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-center justify-between"
                    variants={itemVariants}
                  >
                    <div className="space-y-0.5">
                      <Label>Two-factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline" disabled>Enable</Button>
                  </motion.div>
                  <Separator />
                  <motion.div 
                    className="space-y-4"
                    variants={itemVariants}
                  >
                    <Label>Password</Label>
                    <Button variant="outline" className="w-full" disabled>
                      Change Password
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
