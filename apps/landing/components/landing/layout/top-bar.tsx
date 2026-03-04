"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSettings } from "@/components/providers";

export function TopBar() {
  const t = useTranslations("TopBar");
  const locale = useLocale();
  const { settings } = useSettings();
  const [currentDate, setCurrentDate] = useState("");
  const [greetingKey, setGreetingKey] = useState<
    "morning" | "afternoon" | "evening" | "night"
  >("morning");

  useEffect(() => {
    // Set date
    const now = new Date();

    // Check if locale is 'id' (Indonesian) or 'en' (English)
    // Map 'id' to 'id-ID' and 'en' to 'en-US' for Intl format if strictly needed,
    // but usually 'id' and 'en' work fine in browsers.
    const dateLocale = locale === "id" ? "id-ID" : "en-US";

    const formattedDate = new Intl.DateTimeFormat(dateLocale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(now);

    setCurrentDate(formattedDate);

    // Set greeting based on time
    const hour = now.getHours();
    if (hour < 12) {
      setGreetingKey("morning");
    } else if (hour < 15) {
      setGreetingKey("afternoon");
    } else if (hour < 18) {
      setGreetingKey("evening");
    } else {
      setGreetingKey("night");
    }
  }, [locale]);

  return (
    <div className="bg-secondary text-secondary-foreground h-10">
      <div className="container mx-auto flex h-full items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium md:text-sm">{currentDate}</span>
          <span className="border-border hidden h-4 border-l md:block" />
          <span className="hidden text-sm md:block">
            {t(`greeting.${greetingKey}`)}, {settings?.citizenName || t("citizen")}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs md:gap-4 md:text-sm">
          <a
            href="/kontak"
            className="hover:text-primary transition-colors duration-200"
          >
            {t("contact")}
          </a>
          <span className="text-muted-foreground">|</span>
          <a
            href="/faq"
            className="hover:text-primary transition-colors duration-200"
          >
            {t("help")}
          </a>
        </div>
      </div>
    </div>
  );
}
