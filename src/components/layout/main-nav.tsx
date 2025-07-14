
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { BrainCircuit, Store, Mic } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";

const mainNavItems = [
  { href: "/dashboard/voice", label: "Voice", icon: <Mic /> },
  { href: "/dashboard/create-brain", label: "Create Brain", icon: <BrainCircuit /> },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: <Store /> },
];

export function MainNav() {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();
  
  return (
    <SidebarMenu>
        {mainNavItems.map((item) => {
            const isActive = item.href === '/dashboard/chat' 
                ? pathname.startsWith(item.href) 
                : pathname === item.href;

            return (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                        <Link href={item.href}>
                            {React.cloneElement(item.icon, { className: "h-5 w-5" })}
                            {sidebarState === 'expanded' && <span>{item.label}</span>}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            );
        })}
    </SidebarMenu>
  );
}
