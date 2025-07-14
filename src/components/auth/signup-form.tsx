
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
import { UserPlus, AlertCircle, Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { auth, createUserWithEmailAndPassword, firebaseAppInitialized, signInWithPhoneNumber, RecaptchaVerifier, type ConfirmationResult } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { BrahmaLogoIcon } from "@/components/layout/brahma-logo-icon";

const detailsSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
});


type DetailsFormValues = z.infer<typeof detailsSchema>;

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { toast } = useToast();

  const detailsForm = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });


  const onDetailsSubmit = async (values: DetailsFormValues) => {
    if (!firebaseAppInitialized) {
      toast({ title: "Firebase Not Configured", description: "Cannot sign up. Please check Firebase configuration.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      toast({ title: "Account Created Successfully!", description: "Redirecting to your dashboard..." });
      // Auth context will handle the redirect
    } catch (err: any) {
      let errorMessage = "An unknown error occurred during sign up.";
      if (err.code) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            errorMessage = "This email is already registered. Please use a different email or sign in.";
            break;
          case 'auth/weak-password':
            errorMessage = "The password is too weak. Please choose a stronger password of at least 6 characters.";
            break;
          default:
             errorMessage = err.message || "Failed to create account.";
        }
      }
       setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      {!firebaseAppInitialized && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Firebase Not Configured</AlertTitle>
          <AlertDescription>
            Account creation cannot proceed. Please ensure Firebase is correctly configured by the administrator.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
        <Form {...detailsForm}>
          <form onSubmit={detailsForm.handleSubmit(onDetailsSubmit)} className="space-y-4">
            <FormField control={detailsForm.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl><Input type="email" placeholder="you@example.com" {...field} className="bg-background/70 border-slate-600 focus:border-primary" disabled={isLoading} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={detailsForm.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <FormControl><Input type={showPassword ? "text" : "password"} placeholder="••••••••" {...field} className="bg-background/70 border-slate-600 focus:border-primary pr-10" disabled={isLoading} /></FormControl>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-primary"><EyeOff className={cn("h-5 w-5", { hidden: !showPassword })} /><Eye className={cn("h-5 w-5", { hidden: showPassword })} /></button>
                </div>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={detailsForm.control} name="confirmPassword" render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <div className="relative">
                  <FormControl><Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...field} className="bg-background/70 border-slate-600 focus:border-primary pr-10" disabled={isLoading} /></FormControl>
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-primary"><EyeOff className={cn("h-5 w-5", { hidden: !showConfirmPassword })} /><Eye className={cn("h-5 w-5", { hidden: showConfirmPassword })} /></button>
                </div>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full bg-gradient-primary-accent hover:opacity-90 transition-opacity duration-300 text-primary-foreground font-semibold py-3 mt-2" disabled={isLoading || !firebaseAppInitialized}>
              {isLoading ? <BrahmaLogoIcon className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Create Account
            </Button>
          </form>
        </Form>
    </>
  );
}

// Add this to your global types or a declarations file if you don't have one
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}
