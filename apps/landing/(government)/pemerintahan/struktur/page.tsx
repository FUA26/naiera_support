"use client";

import { useTranslations } from "next-intl";
import { User, Network } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StructurePage() {
  const t = useTranslations("Government.structure");

  return (
    <>
      <main className="bg-muted min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-800 to-indigo-900 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Network className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">
              {t("title")}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/80">
              {t("subtitle")}
            </p>
          </div>
        </section>

        {/* Structure Chart */}
        <section className="container mx-auto px-4 py-12">
          <div className="bg-card relative flex min-h-[600px] justify-center overflow-x-auto rounded-xl p-12 shadow-sm">
            <div className="flex min-w-[800px] flex-col items-center space-y-12">
              {/* Level 1: Bupati & Wakil */}
              <div className="relative flex gap-16">
                {/* Connection Line */}
                <div className="bg-border absolute top-1/2 right-1/4 left-1/4 -z-10 h-0.5" />

                <OrgNode
                  role={t("regent")}
                  name="Dr. H. Ahmad Fauzi, M.Si"
                  image="/placeholder-bupati.jpg"
                  color="bg-indigo-600"
                />
                <OrgNode
                  role={t("viceRegent")}
                  name="Hj. Siti Rahmawati, S.E"
                  image="/placeholder-wabup.jpg"
                  color="bg-indigo-600"
                />
              </div>

              {/* Vertical Line */}
              <div className="bg-border h-12 w-0.5" />

              {/* Level 2: Sekda */}
              <OrgNode
                role={t("secretary")}
                name="Ir. Budi Santoso, M.T"
                color="bg-indigo-500"
              />

              {/* Vertical Line splits */}
              <div className="relative flex w-full justify-center">
                <div className="bg-border absolute top-0 right-1/4 left-1/4 h-0.5" />
                <div className="bg-border absolute top-0 bottom-full left-1/2 h-8 w-0.5 -translate-y-full" />

                {/* This part needs clearer CSS drawing for tree lines, simplifying for now */}
              </div>

              {/* Level 3: Asisten & Staf Ahli */}
              <div className="grid w-full max-w-4xl grid-cols-2 gap-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-border h-8 w-0.5" />
                  <OrgNode
                    role={t("assistants")}
                    name="3 Asisten"
                    color="bg-indigo-400"
                  />
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-border h-8 w-0.5" />
                  <OrgNode
                    role={t("staff")}
                    name="5 Staf Ahli"
                    color="bg-indigo-400"
                  />
                </div>
              </div>

              {/* Level 4: Agencies */}
              <div className="border-border mt-8 w-full border-t pt-8">
                <p className="text-muted-foreground mb-6 text-center font-medium">
                  Perangkat Daerah (Dinas, Badan, Kantor, Kecamatan)
                </p>
                <div className="grid-cols-2md:grid-cols-4 text-muted-foreground grid gap-4 text-center text-sm">
                  <div className="border-border bg-muted rounded-lg border p-3">
                    Dinas Pendidikan
                  </div>
                  <div className="border-border bg-muted rounded-lg border p-3">
                    Dinas Kesehatan
                  </div>
                  <div className="border-border bg-muted rounded-lg border p-3">
                    Bappeda
                  </div>
                  <div className="border-border bg-muted rounded-lg border p-3">
                    Inspektorat
                  </div>
                  <div className="text-muted-foreground/70 col-span-full mt-2 text-xs">
                    ... dan 30+ perangkat daerah lainnya
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function OrgNode({
  role,
  name,
  image,
  color = "bg-slate-600",
}: {
  role: string;
  name: string;
  image?: string;
  color?: string;
}) {
  return (
    <Card className="border-border z-10 w-64 overflow-hidden transition-shadow hover:shadow-md">
      <div className={`h-2 ${color}`} />
      <CardContent className="flex flex-col items-center p-6 text-center">
        <Avatar className="border-muted mb-4 h-20 w-20 border-4">
          {image ? <AvatarImage src={image} alt={name} /> : null}
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <h3 className="text-foreground mb-1 font-bold">{name}</h3>
        <p className="text-muted-foreground text-sm font-medium">{role}</p>
      </CardContent>
    </Card>
  );
}
