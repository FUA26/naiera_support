// Types for events data structure
export interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
  locationUrl?: string;
  category: string;
  categorySlug?: string;
  categoryColor?: string;
  attendees?: string;
  status: "upcoming" | "ongoing" | "completed";
  type: "ONLINE" | "OFFLINE" | "HYBRID";
  image?: string | null;
  description?: string;
  organizer: string;
  organizerContact?: string;
  registrationRequired: boolean;
  registrationUrl?: string;
  maxAttendees?: number | null;
  featured?: boolean;
}

const BACKOFFICE_URL = process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3001';

/**
 * Calculate event status based on date
 */
function calculateEventStatus(eventDate: Date | string): "upcoming" | "ongoing" | "completed" {
  const date = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  if (date < oneDayAgo) {
    return "completed";
  } else if (date <= now && date >= oneDayAgo) {
    return "ongoing";
  } else {
    return "upcoming";
  }
}

/**
 * Add status to events from API
 */
function addStatusToEvents(events: any[]): Event[] {
  return events.map(event => ({
    ...event,
    status: calculateEventStatus(event.date)
  }));
}

/**
 * Fetch all events
 */
export async function getAllEvents(): Promise<Event[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/events`, {
      next: { revalidate: 3600 } // Cache 1 hour
    });
    if (!res.ok) return [];
    const data = await res.json();
    return addStatusToEvents(data.items || []);
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
}

/**
 * Fetch upcoming events
 */
export async function getUpcomingEvents(limit?: number): Promise<Event[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/events/upcoming${limit ? `?limit=${limit}` : ''}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return addStatusToEvents(data || []);
  } catch (error) {
    console.error('Error loading upcoming events:', error);
    return [];
  }
}

/**
 * Fetch events by status
 */
export async function getEventsByStatus(status: 'upcoming' | 'ongoing' | 'completed'): Promise<Event[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/events`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const events = data.items || [];

    const now = new Date();
    return events.filter((event: Event) => {
      const eventDate = new Date(event.date);
      if (status === 'completed') {
        return eventDate < now;
      } else if (status === 'ongoing') {
        return eventDate <= now && eventDate >= new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else {
        return eventDate >= now;
      }
    });
  } catch (error) {
    console.error(`Error loading events with status ${status}:`, error);
    return [];
  }
}

/**
 * Fetch events by category
 */
export async function getEventsByCategory(category: string): Promise<Event[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/events?category=${category}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error loading events for category ${category}:`, error);
    return [];
  }
}

/**
 * Fetch a single event by slug
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/events/${slug}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Error loading event ${slug}:`, error);
    return null;
  }
}

/**
 * Fetch events for a specific month
 */
export async function getEventsByMonth(year: number, month: number): Promise<Event[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/events/calendar?year=${year}&month=${month}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error(`Error loading events for ${year}-${month}:`, error);
    return [];
  }
}

/**
 * Get all unique event categories
 */
export async function getEventCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${BACKOFFICE_URL}/api/public/events/categories`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const categories = await res.json();
    return categories.map((c: any) => c.name);
  } catch (error) {
    console.error('Error loading event categories:', error);
    return [];
  }
}

/**
 * Get event days for calendar widget
 */
export async function getEventDays(year: number, month: number): Promise<number[]> {
  try {
    const events = await getEventsByMonth(year, month);
    return events.map(event => new Date(event.date).getDate());
  } catch (error) {
    console.error(`Error loading event days for ${year}-${month}:`, error);
    return [];
  }
}
