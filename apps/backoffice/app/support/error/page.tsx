import { AlertCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

interface ErrorConfig {
  title: string;
  description: string;
  icon: "expired" | "invalid" | "generic";
  action?: "retry" | "close";
}

const errorConfig: Record<string, ErrorConfig> = {
  TOKEN_EXPIRED: {
    title: "Token Kadaluarsa",
    description: "Token akses Anda telah kedaluwarsa. Token hanya berlaku selama 30 menit untuk keamanan. Silakan kembali ke aplikasi dan minta link akses baru.",
    icon: "expired",
    action: "close",
  },
  INVALID_TOKEN: {
    title: "Token Tidak Valid",
    description: "Token akses tidak valid. Halaman ini hanya dapat diakses melalui aplikasi terintegrasi dengan token yang valid.",
    icon: "invalid",
    action: "close",
  },
  MISSING_TOKEN: {
    title: "Token Tidak Tersedia",
    description: "Token akses tidak tersedia. Halaman ini hanya dapat diakses melalui aplikasi terintegrasi.",
    icon: "invalid",
    action: "close",
  },
  CHANNEL_NOT_FOUND: {
    title: "Channel Tidak Ditemukan",
    description: "Channel aplikasi tidak ditemukan atau tidak aktif. Silakan hubungi tim support.",
    icon: "generic",
    action: "close",
  },
  UNKNOWN: {
    title: "Terjadi Kesalahan",
    description: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi atau hubungi tim support jika masalah berlanjut.",
    icon: "generic",
    action: "retry",
  },
};

export default async function SupportErrorPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const errorKey = params.error || "UNKNOWN";
  const config: ErrorConfig = errorConfig[errorKey] || errorConfig.UNKNOWN;

  const IconComponent = () => {
    switch (config.icon) {
      case "expired":
        return <Clock className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />;
      case "invalid":
        return <XCircle className="h-12 w-12 text-destructive" />;
      default:
        return <AlertCircle className="h-12 w-12 text-muted-foreground" />;
    }
  };

  const iconBgColor = () => {
    switch (config.icon) {
      case "expired":
        return "bg-yellow-100 dark:bg-yellow-900";
      case "invalid":
        return "bg-destructive/10";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-6">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className={`w-20 h-20 ${iconBgColor()} rounded-full flex items-center justify-center mx-auto`}>
              <IconComponent />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold">{config.title}</h1>

            {/* Description */}
            <p className="text-muted-foreground">{config.description}</p>

            {/* Help box */}
            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium mb-2">Akses Tiket Support:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Buka aplikasi terintegrasi Anda</li>
                <li>Menuju halaman "Support" atau "Bantuan"</li>
                <li>Pilih tiket yang ingin dilihat</li>
              </ol>
            </div>

            {/* Action button */}
            {config.action === "retry" ? (
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Coba Lagi
              </Button>
            ) : (
              <Button
                onClick={() => window.close()}
                className="w-full"
              >
                Tutup Halaman
              </Button>
            )}

            {/* Footer note */}
            <p className="text-xs text-muted-foreground">
              Jika masalah berlanjut, hubungi tim support Anda melalui aplikasi.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
