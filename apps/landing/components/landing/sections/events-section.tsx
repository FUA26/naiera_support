"use client";

import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Cloud,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";

interface Event {
  id: string;
  title: string;
  dateStr: string; // Keep ISO string for parsing
  time: string;
  location: string;
  category: string;
  attendees?: string;
  status: "upcoming" | "ongoing" | "completed";
  type: "online" | "offline" | "hybrid";
  image?: string;
  description?: string;
}

export function EventsSection() {
  const t = useTranslations("Events");
  const locale = useLocale();
  const dateLocale = locale === "id" ? "id-ID" : "en-US";

  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0)); // January 2026

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(dateLocale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString(dateLocale, {
    month: "long",
    year: "numeric",
  });

  const eventDays = [7, 8, 9, 10, 12, 15, 17]; // Days with events

  // Generate localized weekday names
  const weekDays = useMemo(() => {
    const days = [];
    const d = new Date(2024, 0, 7); // Jan 7 2024 is a Sunday
    for (let i = 0; i < 7; i++) {
      days.push(
        new Intl.DateTimeFormat(dateLocale, { weekday: "short" }).format(d)
      );
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [dateLocale]);

  const events: Event[] = [
    {
      id: "1",
      title: t("items.event1.title"),
      dateStr: "2025-12-17",
      time: "10:00 - 11:00",
      location: "Gedung Serbaguna Kabupaten",
      category: t("items.event1.category"),
      attendees: "500",
      status: "upcoming",
      type: "offline",
      image: "/images/event-1.jpg",
      description: t("items.event1.desc"),
    },
    {
      id: "2",
      title: t("items.event2.title"),
      dateStr: "2025-12-24",
      time: "09:00 - 22:00",
      location: "Agenda Offline | Umum",
      category: t("items.event2.category"),
      status: "upcoming",
      type: "offline",
      image: "/images/event-2.jpg",
    },
    {
      id: "3",
      title: t("items.event3.title"),
      dateStr: "2025-12-20",
      time: "19:00 - 21:00",
      location: "Agenda Offline | Umum",
      category: t("items.event3.category"),
      status: "upcoming",
      type: "offline",
      image: "/images/event-3.jpg",
    },
    {
      id: "4",
      title: t("items.event4.title"),
      dateStr: "2026-01-12",
      time: "13:00 - 16:00",
      location: "Balai Pelatihan Kerja",
      category: t("items.event4.category"),
      attendees: "150",
      status: "upcoming",
      type: "hybrid",
    },
    {
      id: "5",
      title: t("items.event5.title"),
      dateStr: "2026-01-15",
      time: "08:00 - 17:00",
      location: "Stadion Utama Naiera",
      category: t("items.event5.category"),
      attendees: "2000+",
      status: "upcoming",
      type: "offline",
    },
  ];

  return (
    <section className="bg-muted py-16 md:py-20" id="acara">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            {t("label")}
          </span>
          <h2 className="text-foreground mb-3 text-3xl font-bold md:text-4xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Featured Event & Event List */}
          <div className="space-y-6 lg:col-span-2">
            {/* Featured Event */}
            {events[0] && (
              <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-lg">
                {/* Featured Event Image */}
                <div className="from-primary-light relative h-64 bg-gradient-to-br to-blue-100 md:h-80">
                  {/* Placeholder - replace with actual image */}
                  <div className="from-primary absolute inset-0 bg-gradient-to-br to-blue-600 opacity-70" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Calendar size={64} className="text-white/60" />
                  </div>

                  {/* Event Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold shadow-lg">
                      {events[0].category}
                    </span>
                  </div>
                </div>

                {/* Featured Event Content */}
                <div className="p-6">
                  <h3 className="mb-4 text-2xl leading-tight font-bold text-slate-800">
                    {events[0].title}
                  </h3>

                  <div className="mb-6 space-y-3">
                    <div className="text-muted-foreground flex items-center gap-3">
                      <Calendar size={18} className="text-primary" />
                      <span className="font-medium">
                        {formatDate(events[0].dateStr)}
                      </span>
                      <span className="text-muted-foreground">|</span>
                      <span>{events[0].time}</span>
                    </div>

                    {events[0].description && (
                      <p className="text-muted-foreground leading-relaxed">
                        {events[0].description}
                      </p>
                    )}
                  </div>

                  <div className="border-border flex items-center justify-between border-t pt-4">
                    <a
                      href={`/agenda/${events[0].id}`}
                      className="group text-primary hover:text-primary-hover inline-flex items-center gap-2 font-semibold"
                    >
                      {t("viewMore")}
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </a>
                    <button className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-6 py-2 font-medium transition-colors">
                      {t("representative")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Event List */}
            <div className="space-y-4">
              <h4 className="text-foreground mb-4 text-lg font-bold">
                {t("finished")}
              </h4>

              {events.slice(1, 4).map((event) => (
                <a
                  key={event.id}
                  href={`/agenda/${event.id}`}
                  className="group hover:border-primary/30 border-border bg-card flex gap-4 rounded-xl border p-4 transition-all duration-300 hover:shadow-lg"
                >
                  {/* Event Thumbnail */}
                  <div className="from-muted to-muted-foreground/20 relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br">
                    <div className="from-primary/40 absolute inset-0 bg-gradient-to-br to-blue-500/40" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar size={32} className="text-muted-foreground" />
                    </div>
                  </div>

                  {/* Event Info */}
                  <div className="min-w-0 flex-1">
                    <h5 className="group-hover:text-primary text-foreground mb-2 line-clamp-2 font-bold transition-colors">
                      {event.title}
                    </h5>
                    <div className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
                      <Calendar size={14} />
                      <span>{formatDate(event.dateStr)}</span>
                      <span>•</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <MapPin size={14} />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center">
                    <span className="bg-muted text-muted-foreground rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap">
                      {t("completed")}
                    </span>
                  </div>
                </a>
              ))}

              {/* View All Link */}
              <div className="pt-4 text-center">
                <a
                  href="#semua-agenda"
                  className="group text-primary hover:text-primary-hover inline-flex items-center gap-2 font-semibold transition-colors"
                >
                  {t("viewOthers")}
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Calendar Widget */}
          <div className="lg:col-span-1">
            <div className="border-border bg-card sticky top-24 rounded-2xl border p-6 shadow-sm">
              <h4 className="text-foreground mb-6 text-lg font-bold">
                {t("title")}
              </h4>

              {/* Month Navigation */}
              <div className="mb-6 flex items-center justify-between">
                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() - 1
                      )
                    )
                  }
                  className="hover:bg-muted rounded-lg p-2 transition-colors"
                >
                  <ChevronLeft size={20} className="text-muted-foreground" />
                </button>
                <div className="text-foreground font-semibold">{monthName}</div>
                <button
                  onClick={() =>
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1
                      )
                    )
                  }
                  className="hover:bg-muted rounded-lg p-2 transition-colors"
                >
                  <ChevronRight size={20} className="text-muted-foreground" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="mb-6">
                {/* Day Headers */}
                <div className="mb-2 grid grid-cols-7 gap-1">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="text-muted-foreground py-2 text-center text-xs font-medium"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {/* Days of the month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const hasEvent = eventDays.includes(day);
                    const isToday = day === 6; // Example: 6th is today

                    return (
                      <button
                        key={day}
                        className={`flex aspect-square items-center justify-center rounded-lg text-sm transition-all duration-200 ${
                          isToday
                            ? "bg-primary text-primary-foreground font-bold"
                            : hasEvent
                              ? "bg-primary-lighter text-primary hover:bg-primary-light font-semibold"
                              : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Legend */}
              <div className="border-border space-y-2 border-t pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="bg-primary h-4 w-4 rounded" />
                  <span className="text-muted-foreground">{t("calToday")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="border-primary/30 bg-primary-lighter h-4 w-4 rounded border" />
                  <span className="text-muted-foreground">
                    {t("calHasEvent")}
                  </span>
                </div>
              </div>

              {/* No Event State */}
              <div className="bg-muted mt-6 rounded-xl p-4 text-center">
                <Calendar
                  size={40}
                  className="text-muted-foreground/50 mx-auto mb-2"
                />
                <p className="text-muted-foreground text-sm">
                  {t("calNoEvent")}
                </p>
                <p className="text-muted-foreground/70 text-xs">
                  {t("calNoEventDesc")}
                </p>
              </div>

              {/* View Full Calendar */}
              <a
                href="#kalender-lengkap"
                className="text-primary hover:text-primary-hover mt-4 block text-center text-sm font-semibold"
              >
                {t("viewOthers")} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
