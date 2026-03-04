"use client";

/**
 * Registration Form Component
 *
 * Form for public user registration
 */

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [requireEmailVerification, setRequireEmailVerification] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = form.watch("password");

  // Password strength calculator
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: "Weak", color: "bg-red-500" };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 25, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score: 50, label: "Fair", color: "bg-yellow-500" };
    if (score <= 3) return { score: 75, label: "Good", color: "bg-blue-500" };
    return { score: 100, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(passwordValue || "");

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      // Check if email verification is required
      if (result.requireEmailVerification) {
        setRequireEmailVerification(true);
        setRegistrationSuccess(true);
      } else {
        toast.success("Registration successful! You can now log in.");
        router.push("/login");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message if registration completed
  if (registrationSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center animate-fade-in-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-2">
          <CheckCircle2 className="h-8 w-8 text-success" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Pendaftaran Berhasil!</h3>
          <p className="text-sm text-muted-foreground">
            {requireEmailVerification
              ? "Kami telah mengirimkan email verifikasi. Silakan cek email Anda untuk mengaktifkan akun."
              : "Akun Anda telah berhasil dibuat."}
          </p>
        </div>

        <div className="space-y-4 w-full pt-4">
          {requireEmailVerification && (
            <p className="text-xs text-muted-foreground w-full text-center">
              Belum menerima email?{" "}
              <button
                type="button"
                onClick={() => {
                  setRegistrationSuccess(false);
                  setRequireEmailVerification(false);
                  form.reset();
                }}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Coba kirim ulang
              </button>
            </p>
          )}

          <Button asChild className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors mt-6">
            <Link href="/login">Masuk ke Akun Anda</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formState = form.formState;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-foreground">Nama Lengkap</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
          <Input
            id="name"
            type="text"
            placeholder="Masukkan nama lengkap"
            disabled={isLoading}
            {...form.register("name")}
            className="pl-10 h-11 rounded-xl bg-background border-muted/80 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">{form.formState.errors.name?.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
          <Input
            id="email"
            type="email"
            placeholder="contoh@email.com"
            disabled={isLoading}
            {...form.register("email")}
            className="pl-10 h-11 rounded-xl bg-background border-muted/80 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">{form.formState.errors.email?.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Minimal 8 karakter"
            disabled={isLoading}
            {...form.register("password")}
            className="pl-10 pr-10 h-11 rounded-xl bg-background border-muted/80 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground focus:outline-none transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Eye className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-500">{form.formState.errors.password?.message}</p>
        )}
      </div>

      {/* Password Strength Indicator */}
      {passwordValue && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Kekuatan password:</span>
            <span
              className={`font-medium ${passwordStrength.score === 25
                  ? "text-red-500"
                  : passwordStrength.score === 50
                    ? "text-yellow-500"
                    : passwordStrength.score === 75
                      ? "text-blue-500"
                      : "text-green-500"
                }`}
            >
              {passwordStrength.label}
            </span>
          </div>
          <Progress value={passwordStrength.score} className="h-1.5 rounded-full" />
        </div>
      )}

      {/* Confirm Password */}
      <div className="space-y-2 pb-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Konfirmasi Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Ketik ulang password Anda"
            disabled={isLoading}
            {...form.register("confirmPassword")}
            className="pl-10 pr-10 h-11 rounded-xl bg-background border-muted/80 shadow-none focus-visible:ring-1 focus-visible:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground focus:outline-none transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Eye className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-500">{form.formState.errors.confirmPassword?.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-colors" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          "Daftar Sekarang"
        )}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-4 text-muted-foreground">
            atau pendaftaran via
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pb-2">
        <Button variant="outline" type="button" className="h-11 rounded-xl font-medium shadow-none bg-background hover:bg-muted/50 border-muted transition-colors">
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </Button>
      </div>

      {/* Login Link */}
      <p className="text-center text-sm pt-2">
        <span className="text-muted-foreground mr-1">Sudah punya akun?</span>
        <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
          Masuk di sini <ArrowRight className="inline-block ml-0.5 mb-0.5 w-3.5 h-3.5" />
        </Link>
      </p>
    </form>
  );
}
