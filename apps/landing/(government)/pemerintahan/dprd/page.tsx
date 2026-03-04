"use client";

import { useTranslations } from "next-intl";
import { Users, User, Gavel, Calendar, FileText, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function DprdPage() {
  const t = useTranslations("Government.dpr");

  return (
    <>
      <main className="bg-muted min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-red-800 to-red-900 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Gavel className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              {t("title")}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/80">
              {t("subtitle")}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-12">
          <Tabs defaultValue="members" className="w-full">
            <div className="mb-8 flex justify-center">
              <TabsList className="bg-white/50 backdrop-blur-sm">
                <TabsTrigger value="members" className="gap-2">
                  <Users className="h-4 w-4" />
                  {t("members")}
                </TabsTrigger>
                <TabsTrigger value="commissions" className="gap-2">
                  <FileText className="h-4 w-4" />
                  {t("commissions")}
                </TabsTrigger>
                <TabsTrigger value="agenda" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  {t("agenda")}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Members Tab */}
            <TabsContent value="members">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Leadership */}
                <div className="col-span-full mb-4">
                  <h3 className="border-border text-foreground mb-4 border-b pb-2 text-xl font-bold">
                    Pimpinan DPRD
                  </h3>
                  <div className="grid justify-center gap-6 md:grid-cols-3">
                    <MemberCard
                      name="H. Ketua DPRD"
                      role="Ketua DPRD"
                      party="Partai A"
                    />
                    <MemberCard
                      name="Hj. Wakil I"
                      role="Wakil Ketua I"
                      party="Partai B"
                    />
                    <MemberCard
                      name="H. Wakil II"
                      role="Wakil Ketua II"
                      party="Partai C"
                    />
                  </div>
                </div>

                {/* Members */}
                <div className="col-span-full">
                  <h3 className="border-border text-foreground mb-4 border-b pb-2 text-xl font-bold">
                    Anggota
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                      <MemberCard
                        key={i}
                        name={`Anggota Depan ${i + 1}`}
                        role="Anggota"
                        party={`Partai ${String.fromCharCode(65 + i)}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Commissions Tab */}
            <TabsContent value="commissions">
              <div className="grid gap-6 md:grid-cols-2">
                <CommissionCard name="Komisi A" desc="Bidang Pemerintahan" />
                <CommissionCard
                  name="Komisi B"
                  desc="Bidang Perekonomian & Keuangan"
                />
                <CommissionCard name="Komisi C" desc="Bidang Pembangunan" />
                <CommissionCard
                  name="Komisi D"
                  desc="Bidang Kesejahteraan Rakyat"
                />
              </div>
            </TabsContent>

            {/* Agenda Tab */}
            <TabsContent value="agenda">
              <Card>
                <CardHeader>
                  <CardTitle>Agenda Rapat Bulan Ini</CardTitle>
                  <CardDescription>
                    Jadwal kegiatan dan rapat DPRD Kabupaten Naiera
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        date: "10 Jan",
                        title: "Rapat Paripurna",
                        time: "09:00 WIB",
                        loc: "Ruang Sidang Utama",
                      },
                      {
                        date: "12 Jan",
                        title: "Rapat Komisi A",
                        time: "10:00 WIB",
                        loc: "Ruang Komisi A",
                      },
                      {
                        date: "15 Jan",
                        title: "Dengar Pendapat Umum",
                        time: "13:00 WIB",
                        loc: "Ruang Rapat Gabungan",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="border-border bg-muted flex items-start gap-4 rounded-lg border p-4"
                      >
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          <span className="text-xs font-bold uppercase">
                            {item.date.split(" ")[1]}
                          </span>
                          <span className="text-lg font-bold">
                            {item.date.split(" ")[0]}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-foreground font-bold">
                            {item.title}
                          </h4>
                          <div className="text-muted-foreground mt-1 flex gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {item.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {item.loc}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </>
  );
}

function MemberCard({
  name,
  role,
  party,
}: {
  name: string;
  role: string;
  party: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
      <Avatar className="border-muted h-12 w-12 border-2">
        <AvatarFallback className="bg-muted text-muted-foreground">
          <User className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      <div>
        <h4 className="text-foreground text-sm font-bold">{name}</h4>
        <p className="text-muted-foreground text-xs">{role}</p>
        <Badge className="mt-1 border-0 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50">
          {party}
        </Badge>
      </div>
    </Card>
  );
}

function CommissionCard({ name, desc }: { name: string; desc: string }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-red-700 dark:text-red-400">{name}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Bertanggung jawab dalam pengawasan bidang terkait...
        </p>
      </CardContent>
    </Card>
  );
}
