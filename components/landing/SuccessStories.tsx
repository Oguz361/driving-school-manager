"use client";

import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef, useEffect, useState } from "react";
import { IconTrophy, IconStar, IconUsers, IconCalendar } from "@tabler/icons-react";

// AnimatedCounter component for stats
interface CounterProps {
  target: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

function AnimatedCounter({ target, suffix = "", decimals = 0, duration = 2000 }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutQuad for smooth deceleration
      const easeOut = 1 - (1 - progress) * (1 - progress);
      const currentValue = easeOut * target;

      setCount(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toFixed(decimals)}{suffix}</span>;
}

// Placeholder data - replace with real photos later
const successImagesRow1 = [
  { id: 1, image: "/images/success/placeholder-1.jpg" },
  { id: 2, image: "/images/success/placeholder-2.jpg" },
  { id: 3, image: "/images/success/placeholder-3.jpg" },
  { id: 4, image: "/images/success/placeholder-4.jpg" },
  { id: 5, image: "/images/success/placeholder-5.jpg" },
  { id: 6, image: "/images/success/placeholder-6.jpg" },
];

const successImagesRow2 = [
  { id: 7, image: "/images/success/placeholder-7.jpg" },
  { id: 8, image: "/images/success/placeholder-8.jpg" },
  { id: 9, image: "/images/success/placeholder-9.jpg" },
  { id: 10, image: "/images/success/placeholder-10.jpg" },
  { id: 11, image: "/images/success/placeholder-11.jpg" },
  { id: 12, image: "/images/success/placeholder-12.jpg" },
];

const stats = [
  { value: 10000, suffix: "+", decimals: 0, label: "Absolventen", icon: IconUsers },
  { value: 20, suffix: "+", decimals: 0, label: "Jahre Erfahrung", icon: IconCalendar },
  { value: 4.9, suffix: "", decimals: 1, label: "Google Bewertung", icon: IconStar },
];

function ImageCard({ id }: { id: number }) {
  return (
    <div className="relative w-[280px] md:w-[320px] h-[200px] md:h-[220px] flex-shrink-0 group">
      <div className="relative h-full rounded-xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#1a365d] to-[#0a1628] transition-all duration-300 group-hover:border-white/30 group-hover:scale-[1.02]">
        {/* Image placeholder with gradient background */}
        <div className="absolute inset-0">
          {/* Person placeholder icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <svg
                className="w-8 h-8 md:w-10 md:h-10 text-white/40"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Corner accents - white instead of gold */}
        <div className="absolute top-0 left-0 w-6 h-6 md:w-8 md:h-8 border-t-2 border-l-2 border-white/20 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 border-b-2 border-r-2 border-white/20 opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Success trophy badge */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-[#c41e3a] text-white p-1.5 rounded-full shadow-lg opacity-90 group-hover:opacity-100 transition-opacity">
          <IconTrophy size={14} className="md:w-4 md:h-4" />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* ID label for demo */}
        <div className="absolute bottom-2 left-2 text-white/30 text-xs font-mono">
          #{id}
        </div>
      </div>
    </div>
  );
}

export function SuccessStories() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Duplicate arrays for seamless loop
  const row1Images = [...successImagesRow1, ...successImagesRow1];
  const row2Images = [...successImagesRow2, ...successImagesRow2];

  return (
    <section className="py-20 md:py-28 bg-[#1e3a5f] overflow-hidden relative">
      {/* Subtle pattern overlay - no gold */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Ambient glow effects - crimson only */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c41e3a]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#c41e3a]/5 rounded-full blur-3xl pointer-events-none" />

      <div ref={ref} className="relative z-10">
        {/* Header - Clean Editorial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20 px-6"
        >
          {/* Badge - white/transparent instead of gold */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-6 py-2 text-white/80 border border-white/20
                       rounded-full text-sm tracking-widest uppercase mb-6 bg-white/5 backdrop-blur-sm"
          >
            <IconTrophy size={16} className="text-white/80" />
            Erfolgsgeschichten
          </motion.span>

          {/* Main heading - crimson accent instead of gold gradient */}
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-4">
            Unsere stolzen
            <span className="block text-[#c41e3a] mt-2">Absolventen</span>
          </h2>

          {/* Crimson accent line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-16 h-0.5 bg-[#c41e3a] mx-auto mt-8"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg text-white/60 max-w-2xl mx-auto mt-6"
          >
            Diese Fahrschüler haben ihre Prüfung erfolgreich bestanden. Herzlichen Glückwunsch!
          </motion.p>
        </motion.div>

        {/* Dual Marquee Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative group-hover-pause"
        >
          {/* Fade edges left */}
          <div className="absolute left-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-r from-[#1e3a5f] to-transparent z-10 pointer-events-none" />
          {/* Fade edges right */}
          <div className="absolute right-0 top-0 bottom-0 w-24 md:w-48 bg-gradient-to-l from-[#1e3a5f] to-transparent z-10 pointer-events-none" />

          {/* Row 1: Scrolling left */}
          <div className="flex gap-6 animate-marquee-left hover-pause mb-6">
            {row1Images.map((image, index) => (
              <ImageCard key={`row1-${image.id}-${index}`} id={image.id} />
            ))}
          </div>

          {/* Row 2: Scrolling right */}
          <div className="flex gap-6 animate-marquee-right hover-pause">
            {row2Images.map((image, index) => (
              <ImageCard key={`row2-${image.id}-${index}`} id={image.id} />
            ))}
          </div>
        </motion.div>

        {/* Stats Row - white borders, crimson values */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap justify-center gap-4 md:gap-8 lg:gap-12 mt-16 md:mt-20 px-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="text-center px-6 md:px-8 py-4 md:py-5 border border-white/20 rounded-lg
                         bg-white/5 backdrop-blur-sm
                         hover:border-white/40 transition-colors duration-300"
            >
              <stat.icon size={20} className="text-[#c41e3a] mx-auto mb-2" />
              <p className="text-3xl md:text-4xl font-bold text-[#c41e3a]">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  duration={2000}
                />
              </p>
              <p className="text-white/70 font-medium text-sm md:text-base">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
