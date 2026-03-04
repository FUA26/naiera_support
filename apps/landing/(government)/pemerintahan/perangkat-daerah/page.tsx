"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Building2, Search, MapPin, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AgencyType = "dinas" | "badan" | "kantor" | "kecamatan";

interface Agency {
  id: string;
  name: string;
  type: AgencyType;
  address: string;
  website: string;
}

const agencies: Agency[] = [
  {
    id: "1",
    name: "Dinas Pendidikan",
    type: "dinas",
    address: "Jl. Pendidikan No. 1",
    website: "#",
  },
  {
    id: "2",
    name: "Dinas Kesehatan",
    type: "dinas",
    address: "Jl. Kesehatan No. 5",
    website: "#",
  },
  {
    id: "3",
    name: "Bappeda",
    type: "badan",
    address: "Jl. Perencanaan No. 10",
    website: "#",
  },
  {
    id: "4",
    name: "Inspektorat",
    type: "badan",
    address: "Jl. Pengawasan No. 2",
    website: "#",
  },
  {
    id: "5",
    name: "Kantor Kesbangpol",
    type: "kantor",
    address: "Jl. Merdeka No. 45",
    website: "#",
  },
  {
    id: "6",
    name: "Kecamatan Naiera Utara",
    type: "kecamatan",
    address: "Jl. Raya Utara",
    website: "#",
  },
  {
    id: "7",
    name: "Satpol PP",
    type: "dinas",
    address: "Jl. Praja No. 8",
    website: "#",
  },
  {
    id: "8",
    name: "Dinas Kominfo",
    type: "dinas",
    address: "Jl. Digital No. 99",
    website: "#",
  },
];

export default function AgenciesPage() {
  const t = useTranslations("Government.agencies");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<string>("all");

  const filteredAgencies = agencies.filter((agency) => {
    const matchesSearch = agency.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = activeType === "all" || agency.type === activeType;
    return matchesSearch && matchesType;
  });

  return (
    <>
      <main className="bg-muted min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-800 to-blue-900 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Building2 className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              {t("title")}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/80">
              {t("subtitle")}
            </p>

            {/* Search */}
            <div className="relative mx-auto mt-8 max-w-xl">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 rounded-xl border-0 bg-white pl-12 text-slate-900 shadow-lg placeholder:text-slate-400"
              />
            </div>
          </div>
        </section>

        {/* Filters & Grid */}
        <section className="container mx-auto px-4 py-12">
          <Tabs
            defaultValue="all"
            value={activeType}
            onValueChange={setActiveType}
            className="mb-8"
          >
            <TabsList className="mx-auto flex h-auto w-full max-w-3xl flex-wrap justify-center gap-2 bg-transparent">
              <TabsTrigger
                value="all"
                className="border-border bg-card rounded-full border px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                {t("types.all")}
              </TabsTrigger>
              <TabsTrigger
                value="dinas"
                className="border-border bg-card rounded-full border px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                {t("types.dinas")}
              </TabsTrigger>
              <TabsTrigger
                value="badan"
                className="border-border bg-card rounded-full border px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                {t("types.badan")}
              </TabsTrigger>
              <TabsTrigger
                value="kantor"
                className="border-border bg-card rounded-full border px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                {t("types.kantor")}
              </TabsTrigger>
              <TabsTrigger
                value="kecamatan"
                className="border-border bg-card rounded-full border px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                {t("types.kecamatan")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgencies.map((agency) => (
              <Card
                key={agency.id}
                className="group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader className="border-muted bg-muted/50 border-b pb-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="border-border bg-card text-muted-foreground capitalize"
                    >
                      {agency.type}
                    </Badge>
                    <Building2 className="text-muted-foreground/50 h-5 w-5" />
                  </div>
                  <CardTitle className="text-foreground mt-2 text-lg">
                    {agency.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 pb-2">
                  <div className="text-muted-foreground mb-2 flex items-start gap-2 text-sm">
                    <MapPin className="text-muted-foreground/70 mt-0.5 h-4 w-4 shrink-0" />
                    <span>{agency.address}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-blue-600 transition-all group-hover:pl-4 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                  >
                    {t("website")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {filteredAgencies.length === 0 && (
              <div className="border-border bg-card text-muted-foreground col-span-full rounded-xl border border-dashed py-12 text-center">
                Tidak ada perangkat daerah yang ditemukan.
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
