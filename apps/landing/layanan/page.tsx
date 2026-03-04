import { LayananPageClient } from "./layanan-page-client";
import { getServiceCategories, getAllServices } from "@/lib/services-data";

export default async function LayananPage() {
  // Fetch data from directories
  const categories = await getServiceCategories();
  const allServices = await getAllServices();

  // Map services to convert null to undefined for optional fields
  const services = allServices.map((service) => ({
    ...service,
    badge: service.badge ?? undefined,
    stats: service.stats ?? undefined,
  }));

  return (
    <LayananPageClient categories={categories} services={services} />
  );
}
