"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  IdCard,
  Check,
  X,
  Briefcase,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// Password requirements for validation
const passwordRequirements = [
  {
    label: "Minimal 8 karakter",
    test: (pwd: string) => pwd.length >= 8,
  },
  {
    label: "Mengandung huruf besar (A-Z)",
    test: (pwd: string) => /[A-Z]/.test(pwd),
  },
  {
    label: "Mengandung huruf kecil (a-z)",
    test: (pwd: string) => /[a-z]/.test(pwd),
  },
  {
    label: "Mengandung angka (0-9)",
    test: (pwd: string) => /[0-9]/.test(pwd),
  },
  {
    label: "Mengandung karakter khusus (!@#$%^&*)",
    test: (pwd: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
  },
];

// Comprehensive Zod Schema for all form fields
const formSchema = z
  .object({
    // Step 1 fields
    fullName: z
      .string()
      .min(3, "Nama minimal 3 karakter")
      .max(100, "Nama maksimal 100 karakter"),
    nik: z
      .string()
      .length(16, "NIK harus 16 digit")
      .regex(/^\d+$/, "NIK harus berupa angka"),
    email: z.string().email("Email tidak valid"),
    phone: z
      .string()
      .min(10, "Nomor telepon minimal 10 digit")
      .max(15, "Nomor telepon maksimal 15 digit")
      .regex(/^[0-9]+$/, "Nomor telepon harus berupa angka"),

    // Step 2 fields
    birthDate: z.date({ message: "Tanggal lahir harus diisi" }),
    address: z
      .string()
      .min(10, "Alamat minimal 10 karakter")
      .max(200, "Alamat maksimal 200 karakter"),
    city: z.string().min(3, "Kota/Kabupaten harus diisi"),
    province: z.string().min(1, "Provinsi harus dipilih"),
    occupation: z.string().optional(),

    // Step 3 fields
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Password harus mengandung huruf besar")
      .regex(/[a-z]/, "Password harus mengandung huruf kecil")
      .regex(/[0-9]/, "Password harus mengandung angka")
      .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        "Password harus mengandung karakter khusus"
      ),
    confirmPassword: z.string().min(1, "Konfirmasi password harus diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // Validate on change
    defaultValues: {
      fullName: "",
      nik: "",
      email: "",
      phone: "",
      birthDate: undefined,
      address: "",
      city: "",
      province: "",
      occupation: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");

  // Calculate password strength
  const passwordStrength =
    (passwordRequirements.filter((req) => req.test(password || "")).length /
      passwordRequirements.length) *
    100;

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-amber-500";
    return "bg-primary";
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength < 40) return "Lemah";
    if (passwordStrength < 70) return "Sedang";
    return "Kuat";
  };

  // Validate current step before moving to next
  const validateStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["fullName", "nik", "email", "phone"];
        break;
      case 2:
        fieldsToValidate = ["birthDate", "address", "city", "province"];
        break;
      case 3:
        fieldsToValidate = ["password", "confirmPassword"];
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (_data: FormData) => {
    // console.log("Form submitted:", data);
    // Handle registration logic here
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Image/Info */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-linear-to-br from-primary via-emerald-700 to-blue-700 p-12 lg:flex lg:flex-1">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute right-20 bottom-20 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg text-white">
          <h2 className="mb-6 text-4xl font-bold">
            Bergabung dengan Super App Naiera
          </h2>
          <p className="mb-8 text-xl leading-relaxed text-primary-lighter">
            Daftar sekarang dan nikmati kemudahan akses ke semua layanan
            pemerintahan dalam satu aplikasi.
          </p>

          {/* Progress Steps Info */}
          <div className="mb-8 space-y-6">
            {[
              { step: 1, title: "Data Pribadi", desc: "Informasi dasar Anda" },
              { step: 2, title: "Data Tambahan", desc: "Alamat dan kontak" },
              { step: 3, title: "Keamanan", desc: "Buat password yang kuat" },
            ].map((item) => (
              <div
                key={item.step}
                className={`flex items-center gap-4 transition-all duration-300 ${
                  currentStep === item.step
                    ? "scale-105 opacity-100"
                    : currentStep > item.step
                      ? "opacity-70"
                      : "opacity-40"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
                    currentStep > item.step
                      ? "bg-white text-primary"
                      : currentStep === item.step
                        ? "bg-primary text-white"
                        : "bg-white/20 text-white"
                  }`}
                >
                  {currentStep > item.step ? <Check size={24} /> : item.step}
                </div>
                <div>
                  <p className="text-lg font-semibold">{item.title}</p>
                  <p className="text-sm text-primary-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <p className="mb-1 text-2xl font-bold">50K+</p>
              <p className="text-sm text-primary-light">Pengguna Aktif</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <p className="mb-1 text-2xl font-bold">4.8/5</p>
              <p className="text-sm text-primary-light">Rating Kepuasan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto bg-white p-8">
        <div className="w-full max-w-md py-8">
          {/* Logo & Title */}
          <div className="mb-8">
            <Link
              href="/"
              className="group mb-6 inline-flex items-center gap-3"
            >
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <Image
                  src="/naiera.png"
                  alt="Naiera Logo"
                  fill
                  className="object-contain p-2"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 transition-colors group-hover:text-primary">
                  Super App Naiera
                </h1>
                <p className="text-sm text-slate-500">Kabupaten Naiera</p>
              </div>
            </Link>

            <h2 className="mb-2 text-3xl font-bold text-slate-800">
              Buat Akun Baru
            </h2>
            <p className="text-slate-600">
              Langkah {currentStep} dari 3 -{" "}
              {currentStep === 1
                ? "Data Pribadi"
                : currentStep === 2
                  ? "Data Tambahan"
                  : "Keamanan Akun"}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    step <= currentStep ? "bg-primary" : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Step 1: Data Pribadi */}
              {currentStep === 1 && (
                <div className="animate-fade-in-up space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nama Lengkap <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User
                              size={20}
                              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                            />
                            <Input
                              placeholder="Masukkan nama lengkap"
                              className="pl-11"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          NIK <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <IdCard
                              size={20}
                              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                            />
                            <Input
                              placeholder="16 digit NIK"
                              maxLength={16}
                              className="pl-11"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Sesuai dengan KTP Anda
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail
                              size={20}
                              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                            />
                            <Input
                              type="email"
                              placeholder="nama@email.com"
                              className="pl-11"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nomor Telepon <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone
                              size={20}
                              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                            />
                            <Input
                              type="tel"
                              placeholder="08xxxxxxxxxx"
                              className="pl-11"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Data Tambahan */}
              {currentStep === 2 && (
                <div className="animate-fade-in-up space-y-4">
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>
                          Tanggal Lahir <span className="text-red-500">*</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon size={20} className="mr-2" />
                                {field.value ? (
                                  format(field.value, "PPP", {
                                    locale: idLocale,
                                  })
                                ) : (
                                  <span>Pilih tanggal lahir</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                              captionLayout="dropdown"
                              fromYear={1940}
                              toYear={new Date().getFullYear()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Alamat Lengkap <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin
                              size={20}
                              className="absolute top-3 left-3 text-slate-400"
                            />
                            <Textarea
                              placeholder="Jalan, RT/RW, Kelurahan"
                              rows={3}
                              className="resize-none pl-11"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Kota/Kabupaten <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Home
                              size={20}
                              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                            />
                            <Input
                              placeholder="Contoh: Kabupaten Naiera"
                              className="pl-11"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Provinsi <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih Provinsi" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Jawa Barat">
                              Jawa Barat
                            </SelectItem>
                            <SelectItem value="Jawa Tengah">
                              Jawa Tengah
                            </SelectItem>
                            <SelectItem value="Jawa Timur">
                              Jawa Timur
                            </SelectItem>
                            <SelectItem value="DKI Jakarta">
                              DKI Jakarta
                            </SelectItem>
                            <SelectItem value="Banten">Banten</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pekerjaan</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Briefcase
                              size={20}
                              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                            />
                            <Input
                              placeholder="Contoh: Pegawai Swasta"
                              className="pl-11"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Password */}
              {currentStep === 3 && (
                <div className="animate-fade-in-up space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Password <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock
                              size={20}
                              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                            />
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Buat password yang kuat"
                              className="pr-12 pl-11"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                            >
                              {showPassword ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </button>
                          </div>
                        </FormControl>

                        {/* Password Strength Indicator */}
                        {password && (
                          <div className="mt-2">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs text-slate-600">
                                Kekuatan Password
                              </span>
                              <span
                                className={`text-xs font-semibold ${
                                  passwordStrength < 40
                                    ? "text-red-500"
                                    : passwordStrength < 70
                                      ? "text-amber-500"
                                      : "text-primary"
                                }`}
                              >
                                {getPasswordStrengthLabel()}
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                              <div
                                className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                style={{ width: `${passwordStrength}%` }}
                              />
                            </div>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Requirements Checklist */}
                  <div className="space-y-2 rounded-lg bg-slate-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">
                      Password harus memenuhi:
                    </p>
                    {passwordRequirements.map((requirement, index) => {
                      const isMet = requirement.test(password || "");
                      return (
                        <div
                          key={index}
                          className={`flex items-center gap-2 transition-all duration-200 ${
                            isMet ? "text-primary" : "text-slate-500"
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${
                              isMet
                                ? "bg-primary text-white"
                                : "bg-slate-200"
                            }`}
                          >
                            {isMet ? (
                              <Check size={14} strokeWidth={3} />
                            ) : (
                              <X size={14} strokeWidth={2} />
                            )}
                          </div>
                          <span className="text-sm">{requirement.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Konfirmasi Password{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock
                              size={20}
                              className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                            />
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Ulangi password"
                              className="pr-12 pl-11"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        {confirmPassword && password === confirmPassword && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-primary">
                            <Check size={14} />
                            Password cocok
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Terms & Conditions */}
                  <div className="flex items-start gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-slate-600">
                      Saya menyetujui{" "}
                      <Link
                        href="/terms"
                        className="font-medium text-primary hover:text-primary-hover"
                      >
                        Syarat & Ketentuan
                      </Link>{" "}
                      dan{" "}
                      <Link
                        href="/privacy"
                        className="font-medium text-primary hover:text-primary-hover"
                      >
                        Kebijakan Privasi
                      </Link>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-6">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={handlePrev}
                    variant="outline"
                    className="flex-1 border-2 border-slate-300 py-3 hover:bg-slate-50"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Kembali
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-primary py-3 text-white shadow-lg transition-all duration-300 hover:bg-primary-hover"
                  >
                    Selanjutnya
                    <ArrowRight size={20} className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 bg-primary py-3 text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:bg-primary-hover"
                  >
                    Daftar Sekarang
                  </Button>
                )}
              </div>
            </form>
          </Form>

          {/* Login Link */}
          <p className="mt-6 text-center text-slate-600">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="group inline-flex items-center gap-1 font-semibold text-primary hover:text-primary-hover"
            >
              Masuk di sini
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
