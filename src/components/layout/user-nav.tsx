
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, Moon, Sun, LayoutDashboard, BarChart3, UploadCloud, ListChecks } from "lucide-react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { BrahmaLogoIcon } from "@/components/layout/brahma-logo-icon";

export function UserNav() {
  const { state: sidebarState } = useSidebar();
  const { currentUser, logout, loading } = useAuth();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (error) {
      toast({ title: "Logout Failed", description: "Could not sign you out. Please try again.", variant: "destructive" });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Placeholder for theme toggle
  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    toast({ title: "Theme Toggled (Visual Only)", description: "Theme state management not fully implemented."});
  };

  const isSidebarExpanded = sidebarState === 'expanded';

  if (loading) {
    return (
      <Button variant="ghost" className={`relative h-12 w-full justify-start p-2 ${!isSidebarExpanded ? 'justify-center' : ''}`}>
        <BrahmaLogoIcon className="h-6 w-6 animate-spin" />
      </Button>
    );
  }

  if (!currentUser) {
    // This case should ideally not be reached if DashboardLayout protects routes
    return (
       <Link href="/" passHref>
        <Button variant="ghost" className={`relative h-12 w-full justify-start p-2 ${!isSidebarExpanded ? 'justify-center' : ''}`}>
          Sign In
        </Button>
      </Link>
    );
  }
  
  const userDisplayName = currentUser.displayName || currentUser.email?.split('@')[0] || "User";
  const userEmail = currentUser.email || "No email";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`relative h-12 w-full justify-start p-2 ${!isSidebarExpanded ? 'justify-center' : ''}`} disabled={isLoggingOut}>
           {isLoggingOut && isSidebarExpanded && <BrahmaLogoIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
           {isLoggingOut && !isSidebarExpanded && <BrahmaLogoIcon className="h-6 w-6 animate-spin" />}
          {!isLoggingOut && (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.photoURL || `https://placehold.co/100x100/A78BFA/FFFFFF.png?text=${userDisplayName.charAt(0).toUpperCase()}`} alt={userDisplayName} data-ai-hint="avatar person" />
                <AvatarFallback>{userDisplayName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              {isSidebarExpanded && (
                <div className="ml-2 text-left">
                  <p className="text-sm font-medium truncate">{userDisplayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
              )}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-popover border-border" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userDisplayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/author">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Author Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/dashboard/upload">
              <UploadCloud className="mr-2 h-4 w-4" />
              <span>Upload</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/logs">
              <ListChecks className="mr-2 h-4 w-4" />
              <span>Logs</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleTheme}>
            <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span>Toggle theme</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:!bg-red-500/10 hover:!text-red-400" disabled={isLoggingOut}>
          {isLoggingOut ? <BrahmaLogoIcon className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
