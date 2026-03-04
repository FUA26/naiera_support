"use client";

import { useTranslations } from "next-intl";
import { Landmark, History, Target, Map } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const t = useTranslations("Government.profile");

  return (
    <>
      <main className="bg-muted min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-800 to-emerald-900 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Landmark className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              {t("title")}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/80">
              {t("subtitle")}
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 py-12">
          <Tabs defaultValue="history" className="w-full">
            <div className="mb-8 flex justify-center">
              <TabsList className="bg-white/50 backdrop-blur-sm">
                <TabsTrigger value="history" className="gap-2">
                  <History className="h-4 w-4" />
                  {t("tabs.history")}
                </TabsTrigger>
                <TabsTrigger value="vision" className="gap-2">
                  <Target className="h-4 w-4" />
                  {t("tabs.visionMission")}
                </TabsTrigger>
                <TabsTrigger value="geography" className="gap-2">
                  <Map className="h-4 w-4" />
                  {t("tabs.geography")}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>{t("history")}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground space-y-4 leading-relaxed">
                  <p>
                    Kabupaten Naiera memiliki sejarah panjang yang dimulai sejak
                    era kerajaan kuno. Nama "Naiera" sendiri berasal dari bahasa
                    lokal yang berarti "Tanah Harapan".
                  </p>
                  <p>
                    Pada tahun 1950, Kabupaten Naiera resmi terbentuk sebagai
                    wilayah administratif di bawah pemerintahan Republik
                    Indonesia. Sejak saat itu, Naiera terus berkembang menjadi
                    salah satu pusat pertumbuhan ekonomi dan budaya di wilayah
                    ini.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vision">
              <div className="grid gap-6 md:grid-cols-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary-hover">
                      {t("vision")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <blockquote className="border-primary text-foreground border-l-4 pl-4 text-xl font-medium italic">
                      "Terwujudnya Kabupaten Naiera yang Maju, Sejahtera, dan
                      Berbudaya berbasis Teknologi Digital pada tahun 2030"
                    </blockquote>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary-hover">
                      {t("mission")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-muted-foreground list-disc space-y-3 pl-5">
                      <li>
                        Meningkatkan kualitas sumber daya manusia yang berdaya
                        saing.
                      </li>
                      <li>
                        Mengembangkan infrastruktur daerah yang merata dan
                        berkelanjutan.
                      </li>
                      <li>
                        Mewujudkan tata kelola pemerintahan yang bersih,
                        transparan, dan akuntabel.
                      </li>
                      <li>
                        Memperkuat ekonomi kerakyatan berbasis potensi lokal.
                      </li>
                      <li>
                        Melestarikan nilai-nilai budaya dan kearifan lokal.
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="geography">
              <Card>
                <CardHeader>
                  <CardTitle>{t("geography")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted aspect-video w-full overflow-hidden rounded-lg">
                    <div className="text-muted-foreground flex h-full items-center justify-center">
                      <Map className="mr-2 h-6 w-6" />
                      Peta Wilayah Kabupaten Naiera
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-primary-lighter rounded-lg p-4 text-center">
                      <p className="text-muted-foreground text-sm">
                        Luas Wilayah
                      </p>
                      <p className="text-primary-hover text-xl font-bold">
                        1,234 km²
                      </p>
                    </div>
                    <div className="bg-primary-lighter rounded-lg p-4 text-center">
                      <p className="text-muted-foreground text-sm">
                        Jumlah Penduduk
                      </p>
                      <p className="text-primary-hover text-xl font-bold">
                        540,321 Jiwa
                      </p>
                    </div>
                    <div className="bg-primary-lighter rounded-lg p-4 text-center">
                      <p className="text-muted-foreground text-sm">Kecamatan</p>
                      <p className="text-primary-hover text-xl font-bold">15</p>
                    </div>
                    <div className="bg-primary-lighter rounded-lg p-4 text-center">
                      <p className="text-muted-foreground text-sm">
                        Desa/Kelurahan
                      </p>
                      <p className="text-primary-hover text-xl font-bold">
                        145
                      </p>
                    </div>
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
