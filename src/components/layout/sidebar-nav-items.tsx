
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Settings, BarChart3, UploadCloud, ListChecks, MessageSquare, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";


const mainNavItems = [
  { href: "/dashboard/chat", label: "Chat", icon: <MessageSquare className="h-5 w-5" /> },
  { href: "/dashboard/upload", label: "Upload", icon: <UploadCloud className="h-5 w-5" /> },
  { href: "/dashboard/create-brain", label: "Create Brain", icon: <BrainCircuit className="h-5 w-5" /> },
  { href: "/dashboard/analytics", label: "Analytics", icon: <BarChart3 className="h-5 w-5" /> },
  { href: "/dashboard/logs", label: "Logs", icon: <ListChecks className="h-5 w-5" /> },
  { href: "/dashboard/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

export function MainNav() {
  const pathname = usePathname();
  
  return (
    <nav className="flex flex-col gap-2">
      {mainNavItems.map((item) => {
        const isActive = item.href === '/dashboard/chat' ? pathname.startsWith(item.href) : pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
              "justify-start"
            )}
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
