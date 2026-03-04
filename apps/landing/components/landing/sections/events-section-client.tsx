"use client";

import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Event } from "@/lib/events-data";
import Link from "next/link";

interface EventsSectionClientProps {
  events: Event[];
}

export function EventsSectionClient({ events }: EventsSectionClientProps) {
  const t = useTranslations("Events");
  const locale = useLocale();
  const dateLocale = locale === "id" ? "id-ID" : "en-US";

  const [currentMonth, setCurrentMonth] = useState(new Date()); // Current date
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

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

  // Get events for a specific date
  const getEventsForDate = (day: number) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth.getMonth() &&
        eventDate.getFullYear() === currentMonth.getFullYear()
      );
    });
  };

  // Extract event days for the current month
  const eventDays = useMemo(() => {
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === currentMonth.getMonth() &&
               eventDate.getFullYear() === currentMonth.getFullYear();
      })
      .map(event => new Date(event.date).getDate());
  }, [events, currentMonth]);

  // Get events for selected date
  const selectedDateEvents = selectedDate !== null
    ? getEventsForDate(selectedDate)
    : [];

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

  // Get current date for comparison
  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

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
                  <h3 className="mb-4 text-2xl leading-tight font-bold text-foreground">
                    {events[0].title}
                  </h3>

                  <div className="mb-6 space-y-3">
                    <div className="text-muted-foreground flex items-center gap-3">
                      <Calendar size={18} className="text-primary" />
                      <span className="font-medium">
                        {formatDate(events[0].date)}
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
                    <Link
                      href={`/informasi-publik/agenda-kegiatan/${events[0].slug}`}
                      className="group text-primary hover:text-primary-hover inline-flex items-center gap-2 font-semibold"
                    >
                      {t("viewMore")}
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                    <button className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-6 py-2 font-medium transition-colors">
                      {t("representative")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Events for Selected Date */}
            {selectedDate !== null && selectedDateEvents.length > 0 && (
              <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                <h4 className="text-foreground mb-4 text-lg font-bold">
                  Acara pada {selectedDate} {monthName}
                </h4>
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={`/informasi-publik/agenda-kegiatan/${event.slug}`}
                      className="group hover:border-primary/30 border-border flex gap-4 rounded-xl border p-4 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="from-muted to-muted-foreground/20 relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br">
                        <div className="from-primary/40 absolute inset-0 bg-gradient-to-br to-blue-500/40" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Calendar size={28} className="text-muted-foreground" />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h5 className="group-hover:text-primary text-foreground mb-2 line-clamp-2 font-bold transition-colors">
                          {event.title}
                        </h5>
                        <div className="text-muted-foreground mb-1 flex items-center gap-2 text-sm">
                          <Clock size={14} />
                          <span>{event.time}</span>
                        </div>
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <MapPin size={14} />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <span className={`rounded-lg px-3 py-1 text-xs font-medium whitespace-nowrap ${
                          event.status === "upcoming"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : event.status === "ongoing"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                        }`}>
                          {event.status === "upcoming" ? "Akan Datang" :
                           event.status === "ongoing" ? "Sedang Berlangsung" :
                           "Selesai"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Event List */}
            <div className="space-y-4">
              <h4 className="text-foreground mb-4 text-lg font-bold">
                {selectedDate !== null ? "Acara Lainnya" : t("finished")}
              </h4>

              {(selectedDate !== null
                ? events.slice(1, 4).filter(e => !selectedDateEvents.includes(e))
                : events.slice(1, 4)
              ).map((event) => (
                <Link
                  key={event.id}
                  href={`/informasi-publik/agenda-kegiatan/${event.slug}`}
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
                      <span>{formatDate(event.date)}</span>
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
                      {event.status === "completed" ? t("completed") :
                       event.status === "ongoing" ? t("ongoing") :
                       t("upcoming")}
                    </span>
                  </div>
                </Link>
              ))}

              {/* View All Link */}
              <div className="pt-4 text-center">
                <Link
                  href="/informasi-publik/agenda-kegiatan"
                  className="group text-primary hover:text-primary-hover inline-flex items-center gap-2 font-semibold transition-colors"
                >
                  {t("viewOthers")}
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
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
                  onClick={() => {
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() - 1
                      )
                    );
                    setSelectedDate(null);
                  }}
                  className="hover:bg-muted rounded-lg p-2 transition-colors"
                >
                  <ChevronLeft size={20} className="text-muted-foreground" />
                </button>
                <div className="text-foreground font-semibold">{monthName}</div>
                <button
                  onClick={() => {
                    setCurrentMonth(
                      new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth() + 1
                      )
                    );
                    setSelectedDate(null);
                  }}
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
                    const isSelected = selectedDate === day;
                    const isTodayDay = isToday(day);

                    return (
                      <button
                        key={day}
                        onClick={() => {
                          if (hasEvent) {
                            setSelectedDate(isSelected ? null : day);
                          }
                        }}
                        disabled={!hasEvent}
                        className={`flex aspect-square items-center justify-center rounded-lg text-sm transition-all duration-200 ${
                          isTodayDay && !isSelected
                            ? "bg-primary text-primary-foreground font-bold"
                            : isSelected
                              ? "bg-blue-600 text-white font-bold"
                              : hasEvent
                                ? "bg-primary-lighter text-primary hover:bg-primary-light font-semibold cursor-pointer"
                                : "text-foreground/30 cursor-not-allowed"
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
                {selectedDate !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="bg-blue-600 h-4 w-4 rounded" />
                    <span className="text-muted-foreground">Tanggal Dipilih</span>
                  </div>
                )}
              </div>

              {/* Selected Date Info */}
              {selectedDate !== null && selectedDateEvents.length === 0 && (
                <div className="bg-muted mt-6 rounded-xl p-4 text-center">
                  <Calendar
                    size={40}
                    className="text-muted-foreground/50 mx-auto mb-2"
                  />
                  <p className="text-muted-foreground text-sm">
                    Tidak ada acara pada tanggal ini
                  </p>
                </div>
              )}

              {/* No Event State */}
              {selectedDate === null && (
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
              )}

              {/* View Full Calendar */}
              <Link
                href="/informasi-publik/agenda-kegiatan"
                className="text-primary hover:text-primary-hover mt-4 block text-center text-sm font-semibold"
              >
                {t("viewOthers")} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
