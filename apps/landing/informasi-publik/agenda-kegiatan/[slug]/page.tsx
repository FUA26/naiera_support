import { notFound } from "next/navigation";
import { AgendaDetailClient } from "./agenda-detail-client";
import { getEventBySlug, getAllEvents } from "@/lib/events-data";
import type { Metadata } from "next";

interface AgendaPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all events
export async function generateStaticParams() {
  const events = await getAllEvents();
  return events.map((event) => ({
    slug: event.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: AgendaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Agenda Tidak Ditemukan",
    };
  }

  return {
    title: `${event.title} - Agenda Kegiatan`,
    description: event.description || `Ikuti ${event.title} pada ${event.date}`,
    openGraph: {
      title: event.title,
      description: event.description,
      type: "article",
      publishedTime: event.date,
    },
  };
}

export default async function AgendaDetailPage({ params }: AgendaPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  // Get related events (same category, excluding current event)
  const allEvents = await getAllEvents();
  const relatedEvents = allEvents
    .filter((e) => e.category === event.category && e.id !== event.id)
    .slice(0, 4);

  return (
    <AgendaDetailClient event={event} relatedEvents={relatedEvents} />
  );
}
