
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
import { MailQuestion, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { auth, sendPasswordResetEmail, firebaseAppInitialized } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrahmaLogoIcon } from "@/components/layout/brahma-logo-icon";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    if (!firebaseAppInitialized) {
      toast({ title: "Firebase Not Configured", description: "Cannot send reset email. Please check Firebase configuration.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
    setEmailSent(false);
    try {
      await sendPasswordResetEmail(auth, values.email);
      setEmailSent(true);
      toast({ title: "Password Reset Email Sent", description: "Check your inbox for instructions to reset your password." });
    } catch (e: any) {
      let errorMessage = "An unknown error occurred. Please try again.";
       if (e.code) {
        switch (e.code) {
          case "auth/user-not-found":
             errorMessage = "No user found with this email address.";
            break;
          case "auth/invalid-email":
            errorMessage = "The email address is not valid.";
            break;
          default:
            errorMessage = e.message || "Failed to send password reset email.";
        }
      }
      setError(errorMessage);
      toast({ title: "Error Sending Email", description: errorMessage, variant: "destructive" });
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
            Password reset cannot proceed. Please ensure Firebase is correctly configured by the administrator.
          </AlertDescription>
        </Alert>
      )}
      {emailSent ? (
        <Alert variant="default" className="bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300">
          <MailQuestion className="h-4 w-4 !text-green-500" />
          <AlertTitle>Email Sent Successfully!</AlertTitle>
          <AlertDescription>
            If an account exists for the email provided, a password reset link has been sent. Please check your inbox (and spam folder).
          </AlertDescription>
        </Alert>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
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
                      className="bg-background/70 border-slate-600 focus:border-primary"
                      disabled={isLoading || !firebaseAppInitialized}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary-accent hover:opacity-90 transition-opacity duration-300 text-primary-foreground font-semibold py-3"
              disabled={isLoading || !firebaseAppInitialized}
            >
              {isLoading ? (
                <BrahmaLogoIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <MailQuestion className="mr-2 h-4 w-4" />
              )}
              Send Reset Link
            </Button>
          </form>
        </Form>
      )}
    </>
  );
}
