"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { HiArrowUp } from "react-icons/hi2";
import { scrollToTop } from "./motion/SmoothScroll";

/* Page-wide chrome: spring scroll-progress bar, project-card tilt, back-to-top. */
export default function Effects() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });
  const [showTop, setShowTop] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setShowTop(v > 500));

  useEffect(() => {
    const spot = (e: PointerEvent) => {
      const card = (e.target as Element).closest?.(".spotlight") as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", spot, { passive: true });
    return () => window.removeEventListener("pointermove", spot);
  }, []);

  useEffect(() => {
    const canTilt =
      window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canTilt) return;
    const cleanups: (() => void)[] = [];
    document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
      const move = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg)`;
      };
      const leave = () => (card.style.transform = "");
      card.addEventListener("mousemove", move);
      card.addEventListener("mouseleave", leave);
      cleanups.push(() => {
        card.removeEventListener("mousemove", move);
        card.removeEventListener("mouseleave", leave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-110 h-0.75 origin-left bg-linear-to-r from-gold-deep to-[#fff1d6]"
        style={{ scaleX: progress }}
      />
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.6 }}
            whileHover={{ y: -4, scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            aria-label="Back to top"
            className="fixed bottom-24 right-[1.3rem] z-40 flex h-11 w-11 items-center justify-center rounded-full bg-gold text-on-gold shadow-lg shadow-gold/30"
          >
            <HiArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
