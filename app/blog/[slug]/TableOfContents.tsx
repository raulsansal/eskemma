// app/blog/[slug]/TableOfContents.tsx
"use client";

import { useEffect, useState } from "react";

interface Heading {
  level: number;
  text: string;
  id: string;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="sticky top-24 bg-white-eske border border-gray-eske-30 rounded-lg p-6 shadow-sm max-h-[calc(100vh-120px)] overflow-y-auto">
      <h3 className="text-lg font-semibold text-bluegreen-eske mb-4">
        Tabla de contenidos
      </h3>
      <ul className="space-y-2">
        {headings.map(({ level, text, id }) => (
          <li
            key={id}
            className={`${level === 2 ? "ml-0" : level === 3 ? "ml-4" : "ml-8"}`}
          >
            <a
              href={`#${id}`}
              onClick={(e) => handleClick(e, id)}
              className={`block text-sm transition-colors duration-200 hover:text-bluegreen-eske ${
                activeId === id
                  ? "text-bluegreen-eske font-semibold"
                  : "text-gray-eske-70"
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}