
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileUp } from "lucide-react";
import React, { useState } from "react";

interface FileUploadCardProps {
  onCardClick: () => void;
  disabled?: boolean;
}

export function FileUploadCard({ onCardClick, disabled = false }: FileUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  // We are not using the drop handler for now as it's complex to wire up
  // with the new dialog flow, but the visual feedback is good to keep.
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    // Potentially open dialog on drop in the future
    onCardClick();
  };


  return (
    <Card 
      className={`glassmorphism-card transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isDragging ? 'border-primary scale-105 shadow-primary/40' : 'border-slate-700'}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={disabled ? undefined : onCardClick}
    >
      <CardHeader>
        <CardTitle className="gradient-text">Upload New File</CardTitle>
        <CardDescription>
          Click here to upload video, audio, or text files to build context for Brahma.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div 
            className={`flex flex-col items-center justify-center p-8 md:p-12 border-2 border-dashed rounded-lg transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-slate-600 group-hover:border-slate-500 group-hover:bg-slate-800/20'}`}
        >
          <UploadCloud className={`h-16 w-16 mb-4 transition-colors ${isDragging ? 'text-primary animate-bounce' : 'text-muted-foreground'}`} />
          <p className="mb-2 text-lg font-semibold">
            {isDragging ? "Drop to Upload" : "Click to Upload Content"}
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            You can upload files from your computer or other sources.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
