"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Bell,
  ChevronRight,
  CreditCard,
  Globe,
  Loader2,
  Mail,
  Settings,
  Shield,
  User,
} from "lucide-react";
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
import { Suspense, useEffect, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs2";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EmailSettings from "./EmailSettings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import WalletSettings from "./WalletSettings";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import toast from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const searchParams = useSearchParams();
  const initTab = searchParams.get("tab") || "account";
  const [tab, setTab] = useState(initTab);
  const action = searchParams.get("action");
  const { user, setUser } = useAuth();
  const { useUpdateProfile, useProfile } = useUser();
  const updateProfile = useUpdateProfile();
  const { refetch: refetchProfile } = useProfile();

  // Editable fields state
  const [profile, setProfile] = useState({
    bio: user?.bio || "",
    avatar: user?.avatar || "",
    location: (user as any)?.location || "",
    instagram_handle: user?.instagram_handle || "",
    twitter_handle: user?.twitter_handle || "",
    linkedin_handle: user?.linkedin_handle || "",
    tiktok_handle: user?.tiktok_handle || "",
    youtube_handle: user?.youtube_handle || "",
    website: user?.website || "",
    date_of_birth: (user as any)?.date_of_birth || "",
    gender: (user as any)?.gender || "",
    timezone: user?.timezone || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });

  // Bank details state
  const [bankDetails, setBankDetails] = useState({
    bankName: "KCB",
    bankBranch: "Nairobi",
    accountName: "John Doe",
    accountNumber: "1234567890",
    currency: "KES",
  });

  useEffect(() => {
    setProfile({
      bio: user?.bio || "",
      avatar: user?.avatar || "",
      location: (user as any)?.location || "",
      instagram_handle: user?.instagram_handle || "",
      twitter_handle: user?.twitter_handle || "",
      linkedin_handle: user?.linkedin_handle || "",
      tiktok_handle: user?.tiktok_handle || "",
      youtube_handle: user?.youtube_handle || "",
      website: user?.website || "",
      date_of_birth: (user as any)?.date_of_birth || "",
      gender: (user as any)?.gender || "",
      timezone: user?.timezone || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
    });
  }, [user]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { first_name, last_name, email, ...rest } = profile;
    updateProfile.mutate(rest, {
      onSuccess: async () => {
        toast.success("Profile updated successfully");
        // Refetch user profile and update AuthContext
        const { data } = await refetchProfile();
        if (data && data.result) {
          setUser(data.result);
        }
      },
      onError: () => {
        toast.error("Failed to update profile");
      },
    });
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Bank details updated (not yet saved to backend)");
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className="space-y-6 animate-in"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {(action === "link-email" || user?.is_verified == false) && (
        <Alert
          variant="warning"
          className="bg-yellow-500/10 border-yellow-500/50"
        >
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Email Verification Required</AlertTitle>
          <AlertDescription>
            Please link your email address to enable all features. Add your
            email below to get a verification code.
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
        <motion.p className="text-muted-foreground" variants={itemVariants}>
          Manage your account settings and preferences
        </motion.p>
      </div>

      {/* Mobile bento grid nav */}
      <div className="md:hidden sticky top-0 z-20 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3">
        <div className="grid grid-cols-2 gap-3 px-3">
          <button onClick={() => setTab('account')} className={`flex flex-col items-start justify-start gap-1 rounded-xl border bg-card px-3 py-3 text-left text-sm transition-all ${tab === 'account' ? 'ring-2 ring-primary bg-accent/40' : ''}`}>
            <Mail className="w-4 h-4" />
            Account
          </button>
          <button onClick={() => setTab('general')} className={`flex flex-col items-start justify-start gap-1 rounded-xl border bg-card px-3 py-3 text-left text-sm transition-all ${tab === 'general' ? 'ring-2 ring-primary bg-accent/40' : ''}`}>
            <User className="w-4 h-4" />
            General
          </button>
          <button onClick={() => setTab('billing')} className={`flex flex-col items-start justify-start gap-1 rounded-xl border bg-card px-3 py-3 text-left text-sm transition-all ${tab === 'billing' ? 'ring-2 ring-primary bg-accent/40' : ''}`}>
            <CreditCard className="w-4 h-4" />
            Billing
          </button>
          <button onClick={() => setTab('bank')} className={`flex flex-col items-start justify-start gap-1 rounded-xl border bg-card px-3 py-3 text-left text-sm transition-all ${tab === 'bank' ? 'ring-2 ring-primary bg-accent/40' : ''}`}>
            <CreditCard className="w-4 h-4" />
            Bank Details
          </button>
          <button onClick={() => setTab('security')} className={`flex flex-col items-start justify-start gap-1 rounded-xl border bg-card px-3 py-3 text-left text-sm transition-all ${tab === 'security' ? 'ring-2 ring-primary bg-accent/40' : ''}`}>
            <Shield className="w-4 h-4" />
            Security
          </button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="hidden md:flex md:rounded-md md:bg-muted md:border md:p-1 md:justify-start md:gap-2">
          <TabsTrigger value="account" className="flex items-center gap-2 md:rounded-sm md:px-3 md:py-1.5 md:hover:bg-accent/50 transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Mail className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2 md:rounded-sm md:px-3 md:py-1.5 md:hover:bg-accent/50 transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <User className="w-4 h-4" />
            General
          </TabsTrigger>
          {/* <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger> */}
          <TabsTrigger value="billing" className="flex items-center gap-2 md:rounded-sm md:px-3 md:py-1.5 md:hover:bg-accent/50 transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="bank" className="flex items-center gap-2 md:rounded-sm md:px-3 md:py-1.5 md:hover:bg-accent/50 transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <CreditCard className="w-4 h-4" />
            Bank Details
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 md:rounded-sm md:px-3 md:py-1.5 md:hover:bg-accent/50 transition-colors data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
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
                <CardDescription>Edit your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>First Name</Label>
                      <Input name="first_name" value={profile.first_name} onChange={handleChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Last Name</Label>
                      <Input name="last_name" value={profile.last_name} onChange={handleChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email</Label>
                      <Input name="email" value={profile.email} onChange={handleChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Avatar URL</Label>
                      <Input name="avatar" value={profile.avatar} onChange={handleChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2 md:col-span-2">
                      <Label>Bio</Label>
                      <Textarea name="bio" value={profile.bio} onChange={(e) => handleChange(e)} className="rounded-lg min-h-[120px]" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Location</Label>
                      <Input name="location" value={profile.location} onChange={handleChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Instagram</Label>
                      <Input name="instagram_handle" value={profile.instagram_handle} onChange={handleChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Twitter</Label>
                      <Input name="twitter_handle" value={profile.twitter_handle} onChange={handleChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                      <Label>LinkedIn</Label>
                      <Input name="linkedin_handle" value={profile.linkedin_handle} onChange={handleChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                      <Label>TikTok</Label>
                      <Input name="tiktok_handle" value={profile.tiktok_handle} onChange={handleChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                      <Label>YouTube</Label>
                      <Input name="youtube_handle" value={profile.youtube_handle} onChange={handleChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Website</Label>
                      <Input name="website" value={profile.website} onChange={handleChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Date of Birth</Label>
                      <Input name="date_of_birth" type="date" value={profile.date_of_birth || ""} onChange={handleChange} className="rounded-lg" />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Timezone</Label>
                      <Input name="timezone" value={profile.timezone} onChange={handleChange} className="rounded-lg" />
                    </div>
                  </div>
                  <Button type="submit" disabled={updateProfile.status === 'pending'}>
                    {updateProfile.status === 'pending' ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Preferences
                </CardTitle>
                <CardDescription>View your preferences</CardDescription>
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
                        <SelectItem value="eat">
                          East Africa Time (EAT)
                        </SelectItem>
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

        {/* <TabsContent value="notifications" className="space-y-6">
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
        </TabsContent> */}

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
                  <motion.div className="grid gap-2" variants={itemVariants}>
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
                  <motion.div className="grid gap-2" variants={itemVariants}>
                    <Label>Payment Method</Label>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/5">
                      <div className="flex items-center gap-4">
                        <div className="font-medium">•••• XXXX</div>
                        <Badge variant="outline">Default</Badge>
                      </div>
                      <Button variant="ghost" disabled>
                        Edit
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="bank" className="space-y-6">
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Bank Details
                </CardTitle>
                <CardDescription>
                  Edit your bank details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-4" onSubmit={handleBankSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Bank Name</Label>
                      <Input name="bankName" value={bankDetails.bankName} onChange={handleBankChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Bank Branch</Label>
                      <Input name="bankBranch" value={bankDetails.bankBranch} onChange={handleBankChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Account Name</Label>
                      <Input name="accountName" value={bankDetails.accountName} onChange={handleBankChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Account Number</Label>
                      <Input name="accountNumber" value={bankDetails.accountNumber} onChange={handleBankChange} className="rounded-lg" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Currency</Label>
                      <select name="currency" value={bankDetails.currency} onChange={handleBankChange} className="bg-background border rounded-lg px-2 py-1">
                        <option value="KES">KES (KSH)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
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
                <CardDescription>View your security settings</CardDescription>
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
                    <Button variant="outline" disabled>
                      Enable
                    </Button>
                  </motion.div>
                  <Separator />
                  <motion.div className="space-y-4" variants={itemVariants}>
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
