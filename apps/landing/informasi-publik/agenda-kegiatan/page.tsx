import { AgendaKegiatanClient } from "./agenda-client";
import { getAllEvents, getEventCategories } from "@/lib/events-data";

export default async function AgendaKegiatanPage() {
  // Fetch all events data from JSON
  const allEvents = await getAllEvents();
  const categories = await getEventCategories();

  return <AgendaKegiatanClient allEvents={allEvents} categories={categories} />;
}
