"use client";

import { useState, useEffect } from "react";

interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
    isMobile: typeof window !== "undefined" ? window.innerWidth < 640 : false,
    isTablet: typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function handleResize() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
          isMobile: window.innerWidth < 640,
          isTablet: window.innerWidth < 1024,
        });
      }, 250);
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  return size;
}
