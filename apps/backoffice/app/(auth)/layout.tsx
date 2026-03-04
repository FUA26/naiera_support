import { Check } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Column - Auth Forms */}
      <div className="flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 h-full relative z-10">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {children}
        </div>
      </div>

      {/* Right Column - Hero */}
      <div className="hidden lg:flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 w-full bg-gradient-to-br from-primary to-info relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary-light rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-info rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="max-w-md text-white space-y-8 relative z-10">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Akses Semua Layanan dalam Satu Aplikasi
          </h1>
          <p className="text-lg text-primary-foreground/90 leading-relaxed font-medium">
            Lebih dari 100+ layanan pemerintahan Kabupaten Naiera siap melayani Anda 24/7 dengan cepat, mudah, dan aman.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary-foreground/80 shrink-0" />
              <span className="text-primary-foreground">E-KTP, KK, dan layanan kependudukan</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary-foreground/80 shrink-0" />
              <span className="text-primary-foreground">Pembayaran pajak dan retribusi online</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary-foreground/80 shrink-0" />
              <span className="text-primary-foreground">Perizinan usaha dan IMB</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-primary-foreground/80 shrink-0" />
              <span className="text-primary-foreground">Layanan kesehatan dan pendidikan</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] border border-white/20 mt-12 transform transition hover:scale-[1.02] duration-300">
            <p className="text-sm text-primary-foreground/80 mb-1 font-medium">Dipercaya oleh</p>
            <p className="text-3xl font-bold tracking-tight text-white">50.000+ Pengguna</p>
          </div>
        </div>
      </div>
    </div>
  );
}
