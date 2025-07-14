
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Palette, ShieldCheck, Volume2, LogOut, Save, UploadCloud } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";


export default function SettingsPage() {
  const { toast } = useToast();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [expressiveReplies, setExpressiveReplies] = useState(true);
  const [theme, setTheme] = useState("dark"); // Assume 'dark' is default from layout
  const [voiceId, setVoiceId] = useState<string | null>(null);

  const handleSaveChanges = () => {
    // Placeholder for saving settings
    console.log("Settings saved:", { notificationsEnabled, expressiveReplies, theme, voiceId });
    toast({ title: "Settings Saved (Mock)", description: "Your preferences have been recorded in the console."});
  };
  
  const handleVoiceUpload = () => {
      toast({
          title: "Voice Cloning (Coming Soon!)",
          description: "This feature is not yet implemented. In a full version, this would initiate voice sample upload and cloning.",
          variant: "default",
      });
      // Mock setting a voice ID after a delay
      setTimeout(() => setVoiceId("mock_voice_id_12345"), 1500);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold tracking-tight gradient-text">Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Customize your Brahma experience.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Settings */}
        <Card className="glassmorphism-card md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 gradient-text"><User /> Profile</CardTitle>
            <CardDescription>Manage your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" defaultValue="AI Enthusiast" className="bg-background/70 border-slate-600" />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="user@brahma.com" disabled className="bg-background/70 border-slate-600" />
            </div>
            <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">Change Password</Button>
          </CardContent>
        </Card>

        {/* Application Settings */}
        <Card className="glassmorphism-card md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 gradient-text"><Palette /> Application</CardTitle>
            <CardDescription>Customize application behavior and appearance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2"><Volume2 /> Voice & Emotion</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border border-slate-700 p-4 bg-background/50 gap-4">
                <Label htmlFor="voice-cloning" className="flex flex-col space-y-1">
                  <span>Voice Cloning</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Enroll your voice for personalized audio responses.
                  </span>
                </Label>
                {voiceId ? (
                   <Badge variant="default" className="bg-green-500/20 text-green-300 border-green-500/30">Voice Enrolled ✔️</Badge>
                ) : (
                  <Button variant="secondary" onClick={handleVoiceUpload}>
                    <UploadCloud className="mr-2 h-4 w-4" /> Upload Voice Sample
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-700 p-4 bg-background/50">
                <Label htmlFor="expressive-replies" className="flex flex-col space-y-1">
                  <span>Enable Expressive Replies</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Allows Brahma to respond with an emotional tone.
                  </span>
                </Label>
                <Switch
                  id="expressive-replies"
                  checked={expressiveReplies}
                  onCheckedChange={setExpressiveReplies}
                  aria-label="Toggle expressive replies"
                />
              </div>
            </div>
            
            <Separator className="bg-slate-700" />

            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center gap-2"><Palette /> Theme</h3>
               <div className="flex items-center justify-between rounded-lg border border-slate-700 p-4 bg-background/50">
                <Label htmlFor="theme-mode" className="flex flex-col space-y-1">
                  <span>Dark Mode</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Enable or disable dark theme for the application.
                  </span>
                </Label>
                <Switch
                  id="theme-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => {
                    setTheme(checked ? 'dark' : 'light');
                    document.documentElement.classList.toggle('dark', checked);
                  }}
                  aria-label="Toggle dark mode"
                />
              </div>
            </div>

            <Separator className="bg-slate-700" />
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center gap-2"><Bell /> Notifications</h3>
              <div className="flex items-center justify-between rounded-lg border border-slate-700 p-4 bg-background/50">
                <Label htmlFor="notifications-enabled" className="flex flex-col space-y-1">
                  <span>Enable Notifications</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Receive updates for file processing and important events.
                  </span>
                </Label>
                <Switch
                  id="notifications-enabled"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  aria-label="Toggle notifications"
                />
              </div>
            </div>
            
          </CardContent>
        </Card>
      </div>
      
      {/* Security Settings - Placeholder */}
      <Card className="glassmorphism-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text"><ShieldCheck /> Security</CardTitle>
          <CardDescription>Manage account security and linked services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Two-Factor Authentication (2FA) is currently <span className="text-primary font-medium">Disabled</span>.</p>
          <Button variant="outline" className="border-slate-600 hover:bg-slate-700/50">Enable 2FA</Button>
          <div>
            <h4 className="font-medium text-foreground">Linked Accounts</h4>
            <p className="text-sm text-muted-foreground">You are signed in with Google.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button 
            size="lg" 
            className="bg-gradient-primary-accent text-primary-foreground hover:opacity-90 transition-opacity"
            onClick={handleSaveChanges}
        >
          <Save className="mr-2 h-5 w-5" /> Save Changes
        </Button>
      </div>
    </div>
  );
}
