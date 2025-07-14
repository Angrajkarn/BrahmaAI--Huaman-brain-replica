
"use client";

import React from "react";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  // The main dashboard layout now handles the sidebar.
  // This pass-through component prevents a duplicate sidebar on chat pages.
  return <>{children}</>;
}
