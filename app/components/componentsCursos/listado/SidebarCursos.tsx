// app/components/componentsCursos/listado/SidebarCursos.tsx
import type { CourseCardItem } from "@/types/course.types";
import PopularCourses from "./PopularCourses";
import CategoryListCourses from "./CategoryListCourses";
import TagCloudCourses from "./TagCloudCourses";
import NewsletterSignup from "../../componentsBlog/NewsletterSignup";

interface SidebarCursosProps {
  popularCourses: CourseCardItem[];
  categories: { id: string; name: string; count: number }[];
  tags: { tag: string; count: number }[];
}

export default function SidebarCursos({
  popularCourses,
  categories,
  tags,
}: SidebarCursosProps) {
  return (
    <aside className="space-y-6">
      <PopularCourses courses={popularCourses} />
      <CategoryListCourses categories={categories} />
      <TagCloudCourses tags={tags} />
      <NewsletterSignup />
    </aside>
  );
}
