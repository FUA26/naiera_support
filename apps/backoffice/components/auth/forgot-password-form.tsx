"use client";

/**
 * Forgot Password Form Component
 *
 * Form for users to request a password reset email
 */

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send reset email");
      }

      setIsSuccess(true);
      toast.success("If an account exists with that email, a password reset link has been sent.");
    } catch (error) {
      console.error("Failed to send reset email:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center animate-fade-in-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-2">
          <CheckCircle2 className="h-8 w-8 text-primary" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Cek email Anda</h3>
          <p className="text-sm text-muted-foreground max-w-[300px] mx-auto">
            Kami telah mengirimkan instruksi untuk me-reset password ke email Anda. Silakan cek kotak masuk Anda.
          </p>
        </div>

        <div className="rounded-xl border border-muted/80 bg-background shadow-xs p-5 text-sm text-left text-muted-foreground w-full mt-4">
          <p className="font-medium text-foreground">Tidak menerima email?</p>
          <ul className="mt-3 space-y-2 text-xs">
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1"></div> Cek folder spam atau junk Anda</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1"></div> Pastikan alamat email sudah benar</li>
            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1"></div> Tunggu beberapa menit hingga email sampai</li>
          </ul>
        </div>

        <Button
          variant="outline"
          className="w-full h-11 rounded-xl font-medium shadow-none bg-background hover:bg-muted/50 border-muted transition-colors mt-6"
          onClick={() => {
            setIsSuccess(false);
            form.reset();
          }}
        >
          Coba lagi
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
          <Input
            id="email"
            type="email"
            placeholder="Masukkan alamat email Anda"
            autoComplete="email"
            {...form.register("email")}
            disabled={isLoading}
            className="pl-10 h-11 rounded-xl bg-background border-muted/80 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">{form.formState.errors.email?.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mengirim...
          </>
        ) : (
          "Kirim Tautan Reset"
        )}
      </Button>

      <div className="pt-2 text-center text-sm">
        <a href="/login" className="inline-flex items-center text-muted-foreground hover:text-foreground font-medium transition-colors">
          <ArrowLeft className="mr-1.5 w-4 h-4" /> Kembali ke masuk
        </a>
      </div>
    </form>
  );
}
