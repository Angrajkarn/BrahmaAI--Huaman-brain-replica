
"use client";

import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { Logo } from "@/components/logo";
import Link from 'next/link';
import { AtomFieldAnimation } from "@/components/layout/atom-animation";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
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
            <h1 className="text-3xl font-bold text-center gradient-text">Forgot Password?</h1>
            <p className="text-center text-muted-foreground pt-1 mt-2">
              No problem. We&apos;ll send a reset link to your email.
            </p>
          </div>
          <ForgotPasswordForm />
        </div>
        
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Remembered it?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to Sign In
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
