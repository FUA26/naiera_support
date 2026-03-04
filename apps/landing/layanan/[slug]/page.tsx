import { notFound } from "next/navigation";
import { getServiceBySlug, getAllServices, type DownloadForm as ApiDownloadForm } from "@/lib/services-data";
import { ServiceDetailClient } from "./service-detail-client";

interface DownloadForm {
  name: string;
  url: string;
}

interface ContactInfo {
  office: string;
  phone: string;
  email: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface RelatedService {
  slug: string;
  iconName: string;
  name: string;
}

// Helper to map API DownloadForm to page DownloadForm
function mapDownloadForms(forms: ApiDownloadForm[] | null | undefined): DownloadForm[] {
  if (!forms || forms.length === 0) return [];
  return forms.map((form) => ({
    name: form.name,
    url: form.type === 'url' ? form.value : `/api/files/${form.fileId}/serve`,
  }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  // Build related services data
  let relatedServicesData: RelatedService[] = [];
  if (service.relatedServices && service.relatedServices.length > 0) {
    const allServices = await getAllServices();
    relatedServicesData = service.relatedServices
      .map((relatedSlug) => {
        const relatedService = allServices.find((s) => s.slug === relatedSlug);
        if (!relatedService) return null;
        return {
          slug: relatedService.slug,
          iconName: relatedService.icon,
          name: relatedService.name,
        };
      })
      .filter((s): s is RelatedService => s !== null);
  }

  const serviceDetailData = {
    slug: service.slug,
    iconName: service.icon,
    name: service.name,
    description: service.description,
    detailedDescription: service.detailedDescription || service.description,
    category: {
      name: service.category.name,
      slug: service.category.slug,
    },
    badge: service.badge,
    stats: service.stats,
    isIntegrated: service.isIntegrated,
    requirements: service.requirements || [],
    process: service.process || [],
    duration: service.duration || "Informasi tidak tersedia",
    cost: service.cost || "Informasi tidak tersedia",
    contactInfo: service.contactInfo || {
      office: "Informasi tidak tersedia",
      phone: "-",
      email: "-",
    },
    downloadForms: mapDownloadForms(service.downloadForms),
    relatedServices: relatedServicesData,
    faqs: service.faqs || [],
  };

  return <ServiceDetailClient service={serviceDetailData} />;
}
