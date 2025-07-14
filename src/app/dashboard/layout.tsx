
"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/auth-context";
import { BrahmaLogoIcon } from "@/components/layout/brahma-logo-icon";
import { SidebarProvider, Sidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { ChatHistorySidebar } from "@/app/dashboard/chat-history-sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";

// A new header component for non-chat pages
const DashboardHeader = () => (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 md:hidden">
        <SidebarTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
        </SidebarTrigger>
    </header>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login"); // Redirect to login if not authenticated and not loading
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
          }}
        >
          <BrahmaLogoIcon className="h-20 w-20" />
        </motion.div>
        <p className="text-muted-foreground mt-4 text-lg">Initializing cognitive core...</p>
      </div>
    );
  }

  const isChatPage = pathname.startsWith('/dashboard/chat');

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar>
           <ChatHistorySidebar />
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0">
           {!isChatPage && <DashboardHeader />}
           <main className={cn(
             "flex-1",
             isChatPage ? "flex flex-col min-h-0" : "overflow-y-auto modern-scrollbar p-4 sm:p-6 lg:p-8"
           )}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className={cn(isChatPage && "flex flex-col h-full")}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
           </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
