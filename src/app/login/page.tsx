
"use client";

import LoginForm from "@/components/auth/login-form";
import { Logo } from "@/components/logo";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from 'next/link';
import { AtomFieldAnimation } from "@/components/layout/atom-animation";
import { motion } from "framer-motion";
import { BrahmaLogoIcon } from "@/components/layout/brahma-logo-icon";

export default function LoginPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, loading, router]);

  if (loading || currentUser) {
    return (
      <main className="relative flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-background overflow-hidden">
        <AtomFieldAnimation />
        <div className="relative z-10 flex flex-col items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <BrahmaLogoIcon className="h-20 w-20" />
            </motion.div>
            <p className="text-muted-foreground mt-4 text-lg">Authenticating...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-background overflow-hidden">
       <AtomFieldAnimation />
       <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
       >
        <div className="text-center mb-8">
          <Logo isLink className="justify-center" iconSize={48} textSize="text-5xl" />
        </div>
        
        <div className="glassmorphism-card shadow-2xl bg-card/80 p-6 sm:p-10 rounded-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-center gradient-text">Welcome Back</h1>
            <p className="text-center text-muted-foreground pt-1 mt-2">
              Sign in to access your cognitive dashboard.
            </p>
          </div>
          <LoginForm />
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign Up
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
