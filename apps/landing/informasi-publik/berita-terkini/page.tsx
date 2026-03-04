import { BeritaTerkiniClient } from "./berita-terkini-client";
import { getAllNews, getNewsCategories } from "@/lib/news-data";

export default async function BeritaTerkiniPage() {
  // Fetch all news data from JSON
  const allNews = await getAllNews();
  const categories = await getNewsCategories();

  return <BeritaTerkiniClient allNews={allNews} categories={categories} />;
}
