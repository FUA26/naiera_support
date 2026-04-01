import { Suspense } from "react";
import { TicketDetailPublic } from "./components/ticket-detail-public";
import { Loader2, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function PublicTicketDetailPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const token = searchParams.token;

  // Token is required for access
  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">Akses Ditolak</h1>
                <p className="text-muted-foreground mt-2">
                  Token akses tidak tersedia. Halaman ini hanya dapat diakses melalui aplikasi terintegrasi.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
                <p className="text-sm font-medium">Cara mengakses tiket:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Buka aplikasi terintegrasi Anda</li>
                  <li>Menuju halaman "Support" atau "Bantuan"</li>
                  <li>Pilih tiket yang ingin dilihat</li>
                </ol>
              </div>

              <Button
                onClick={() => window.close()}
                variant="outline"
                className="w-full"
              >
                Tutup Halaman
              </Button>

              <p className="text-xs text-muted-foreground">
                Jika Anda yakin seharusnya memiliki akses, silakan hubungi tim support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <TicketDetailPublic ticketId={(await props.params).id} token={token} />
      </Suspense>
    </div>
  );
}
