
"use client"
import { MessageSquareText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatListPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new chat creation page immediately
    router.replace('/dashboard/chat/new');
  }, [router]);
  
  // Render a placeholder while redirecting
  return (
     <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
      <MessageSquareText className="h-16 w-16 text-muted-foreground/50" />
      <h2 className="text-2xl font-semibold">Select or start a conversation</h2>
      <p className="text-muted-foreground max-w-sm">
        Choose a chat from the history on the left, or start a new one to begin.
      </p>
    </div>
  );
}
