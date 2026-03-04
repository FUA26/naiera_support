"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Map, User, Home, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Mock Data
const districtsData = [
  {
    id: "1",
    name: "Naiera Utara",
    camat: "Budi Harsono, S.IP",
    address: "Jl. Raya Utara No. 1",
    villages: [
      "Desa Maju",
      "Kelurahan Sejahtera",
      "Desa Makmur",
      "Desa Damai",
      "Kelurahan Indah",
    ],
  },
  {
    id: "2",
    name: "Naiera Selatan",
    camat: "Siti Aminah, S.Sos",
    address: "Jl. Selatan Raya No. 10",
    villages: ["Desa Pantai", "Desa Laut", "Kelurahan Pesisir", "Desa Karang"],
  },
  {
    id: "3",
    name: "Naiera Barat",
    camat: "Joko Susilo, M.Si",
    address: "Jl. Barat Utama No. 5",
    villages: ["Desa Bukit", "Desa Lembah", "Desa Sungai", "Kelurahan Gunung"],
  },
  {
    id: "4",
    name: "Naiera Timur",
    camat: "Rina Wati, S.E",
    address: "Jl. Timur Indah No. 8",
    villages: [
      "Desa Matahari",
      "Desa Bulan",
      "Kelurahan Bintang",
      "Desa Langit",
      "Desa Awan",
    ],
  },
  {
    id: "5",
    name: "Naiera Pusat",
    camat: "Ahmad Yani, S.IP",
    address: "Jl. Protokol No. 1",
    villages: [
      "Kelurahan Kota",
      "Kelurahan Alun-alun",
      "Kelurahan Pasar",
      "Desa Taman",
    ],
  },
];

export default function DistrictsPage() {
  const t = useTranslations("Government.districts");
  const firstDistrict = districtsData[0]!;
  const [selectedId, setSelectedId] = useState(firstDistrict.id);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDistricts = districtsData.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDistrict =
    districtsData.find((d) => d.id === selectedId) ?? firstDistrict;

  return (
    <>
      <main className="bg-muted min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-teal-700 to-teal-800 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Map className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              {t("title")}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/80">
              {t("subtitle")}
            </p>
          </div>
        </section>

        {/* Layout */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 lg:h-[600px] lg:flex-row">
            {/* Sidebar List */}
            <Card className="flex h-[500px] w-full flex-col lg:h-full lg:w-1/3">
              <div className="border-b p-4">
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder={t("searchPlaceholder")}
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-1 p-2">
                  {filteredDistricts.map((district) => (
                    <button
                      key={district.id}
                      onClick={() => setSelectedId(district.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                        selectedId === district.id
                          ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedId === district.id ? "bg-teal-200 text-teal-700 dark:bg-teal-800 dark:text-teal-400" : "bg-muted text-muted-foreground"}`}
                        >
                          <Map className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <span className="block">{district.name}</span>
                          <span className="text-muted-foreground text-xs font-normal">
                            {t("villageCount", {
                              count: district.villages.length,
                            })}
                          </span>
                        </div>
                      </div>
                      {selectedId === district.id && (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                  {filteredDistricts.length === 0 && (
                    <div className="text-muted-foreground p-4 text-center text-sm">
                      Tidak ditemukan.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>

            {/* Detail View */}
            <Card className="flex h-full w-full flex-col overflow-hidden lg:w-2/3">
              <CardHeader className="bg-muted border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground text-2xl">
                      {selectedDistrict.name}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {selectedDistrict.address}
                    </p>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-muted-foreground mb-1 text-xs font-bold tracking-wider uppercase">
                      {t("camat")}
                    </p>
                    <div className="flex items-center justify-end gap-2">
                      <User className="h-4 w-4 text-teal-600" />
                      <span className="text-foreground font-medium">
                        {selectedDistrict.camat}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full">
                  <div className="p-6">
                    <h3 className="text-foreground mb-4 flex items-center gap-2 font-semibold">
                      <Home className="h-4 w-4 text-teal-600" />
                      {t("villages")}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedDistrict.villages.map((village, idx) => (
                        <div
                          key={idx}
                          className="border-border bg-card flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-teal-200 dark:hover:border-teal-800"
                        >
                          <div className="h-2 w-2 rounded-full bg-teal-400" />
                          <span className="text-foreground">{village}</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-6" />

                    <div className="text-muted-foreground text-sm">
                      <p className="mb-2">Informasi tambahan:</p>
                      <p>
                        Kecamatan {selectedDistrict.name} merupakan salah satu
                        kecamatan yang memiliki potensi wisata alam yang cukup
                        besar...
                      </p>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
