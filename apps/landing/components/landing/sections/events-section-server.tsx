import { EventsSectionClient } from './events-section-client';
import { getUpcomingEvents } from '@/lib/events-data';

/**
 * Server Component wrapper for EventsSection
 * Fetches events data from directories and passes to client component
 */
export async function EventsSection() {
  // Fetch events data from directories
  const events = await getUpcomingEvents(8);

  return <EventsSectionClient events={events} />;
}
