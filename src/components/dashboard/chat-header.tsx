
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2, MoreHorizontal, Trash2, Archive, Pencil, PanelLeft } from "lucide-react";
import { BrahmaLogoIcon } from "../layout/brahma-logo-icon";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

interface ChatHeaderProps {
  sessionTitle: string;
  onShare: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onRename: () => void;
}

export function ChatHeader({ sessionTitle, onShare, onDelete, onArchive, onRename }: ChatHeaderProps) {
  const { toggleSidebar } = useSidebar();
  
  return (
    <div className="flex items-center justify-between px-2 md:px-4 py-2 border-b border-border flex-shrink-0 bg-background z-10">
      <div className="flex items-center gap-2">
        <SidebarTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
                <PanelLeft />
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
        </SidebarTrigger>
        <div className="flex items-center gap-2">
            <BrahmaLogoIcon className="h-6 w-6" />
            <h1 className="text-lg font-semibold text-foreground truncate">{sessionTitle}</h1>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onShare}>
          <Share2 className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">Share</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem onClick={onRename}>
                <Pencil className="mr-2 h-4 w-4" />
                Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
             <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 hover:!bg-red-500/10 focus:text-red-400 focus:!bg-red-500/10" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
