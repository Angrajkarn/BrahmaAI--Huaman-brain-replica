
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { Separator } from "../ui/separator";
import Link from "next/link";
import { auth, signInWithEmailAndPassword, firebaseAppInitialized, GoogleAuthProvider, signInWithPopup } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrahmaLogoIcon } from "@/components/layout/brahma-logo-icon";


const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    if (!firebaseAppInitialized) {
      toast({ title: "Firebase Not Configured", description: "Cannot sign in. Please check Firebase configuration.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Signed In Successfully!", description: "Redirecting to dashboard..." });
    } catch (e: any) {
      let errorMessage = "An unknown error occurred. Please try again.";
      if (e.code) {
        switch (e.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
          case "auth/invalid-credential":
            errorMessage = "The email or password you entered is incorrect. Please double-check your credentials.";
            break;
          case "auth/invalid-email":
            errorMessage = "The email address is not valid.";
            break;
          case "auth/user-disabled":
            errorMessage = "This user account has been disabled.";
            break;
          default:
            errorMessage = e.message || "Failed to sign in.";
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    if (!firebaseAppInitialized) {
      toast({ title: "Firebase Not Configured", description: "Cannot sign in. Please check Firebase configuration.", variant: "destructive" });
      return;
    }
    setIsGoogleLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "Signed In Successfully!", description: "Redirecting to dashboard..." });
      // The AuthProvider's onAuthStateChanged will handle the redirect.
    } catch (e: any) {
      let errorMessage = "An unknown error occurred. Please try again.";
      if (e.code) {
        switch (e.code) {
          case "auth/popup-closed-by-user":
            // This is a common case, so we can give a more gentle message.
            errorMessage = "Sign-in popup was closed before completing. Please try again.";
            break;
          case "auth/account-exists-with-different-credential":
            errorMessage = "An account already exists with the same email address but different sign-in credentials.";
            break;
          case "auth/cancelled-popup-request":
             errorMessage = "The sign-in process was cancelled. Please try again.";
            break;
          case "auth/unauthorized-domain":
            errorMessage = "This domain is not authorized for Google Sign-In. The developer must add it to the Firebase console's list of authorized domains in Authentication > Settings.";
            break;
          default:
            errorMessage = e.message || "Failed to sign in with Google.";
        }
      }
      setError(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      {!firebaseAppInitialized && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Firebase Not Configured</AlertTitle>
          <AlertDescription>
            Authentication cannot proceed. Please ensure Firebase is correctly configured by the administrator.
          </AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    {...field} 
                    className="bg-card/80 border-slate-600 focus:border-primary"
                    disabled={isLoading || isGoogleLoading || !firebaseAppInitialized}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      {...field} 
                      className="bg-card/80 border-slate-600 focus:border-primary pr-10"
                      disabled={isLoading || isGoogleLoading || !firebaseAppInitialized}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-primary transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="text-sm text-right">
            <Link href="/forgot-password" className="font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-primary-accent hover:opacity-90 transition-opacity duration-300 text-primary-foreground font-semibold py-3"
            disabled={isLoading || isGoogleLoading || !firebaseAppInitialized}
          >
            {isLoading ? (
              <BrahmaLogoIcon className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            Sign In
          </Button>
        </form>
      </Form>
      <Separator className="my-6 bg-slate-700" />
      <Button 
        variant="outline" 
        className="w-full border-slate-600 hover:bg-slate-700/50 hover:text-foreground py-3"
        onClick={handleGoogleSignIn}
        disabled={isLoading || isGoogleLoading || !firebaseAppInitialized}
      >
        {isGoogleLoading ? (
          <BrahmaLogoIcon className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Sign in with Google
      </Button>
    </>
  );
}
