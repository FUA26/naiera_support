import { ServicesSectionClient } from './services-section-client';
import { getServicesGroupedByCategory } from '@/lib/services-data';

/**
 * Server Component wrapper for ServicesSection
 * Fetches service data from directories and passes to client component
 */
export async function ServicesSection() {
  // Fetch services data from directories
  const serviceCategories = await getServicesGroupedByCategory();

  // Map categories and services to convert null to undefined for optional fields
  const mappedCategories = serviceCategories.map((category) => ({
    ...category,
    services: category.services.map((service) => ({
      ...service,
      badge: service.badge ?? undefined,
      stats: service.stats ?? undefined,
    })),
  }));

  return <ServicesSectionClient serviceCategories={mappedCategories} />;
}
