"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Fades a section in as it enters the viewport.
 *
 * Three rules keep this from ever hiding content for real:
 *   · it renders visible, and only JavaScript adds the class that hides it;
 *   · anything already on screen at mount is left alone, so the first frame is
 *     never animated and a thumbnail shows real content;
 *   · a failsafe timer reveals the section even if the observer never fires.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.classList.add("js");
    const show = () => el.classList.add("in");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            show();
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    io.observe(el);

    const failsafe = window.setTimeout(show, 2500);

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
