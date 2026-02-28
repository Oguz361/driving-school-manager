"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useInView } from "motion/react";
import { useRef, useEffect } from "react";

interface Stat {
  value: number | string;
  suffix: string;
  label: string;
  isNumeric: boolean;
}

const stats: Stat[] = [
  { value: 25, suffix: "+", label: "Jahre Erfahrung", isNumeric: true },
  { value: 10000, suffix: "+", label: "Erfolgreiche Absolventen", isNumeric: true },
  { value: "", suffix: "", label: "Hohe Erfolgsquote", isNumeric: false },
];

function AnimatedNumber({ value, isInView }: { value: number; isInView: boolean }) {
  const spring = useSpring(0, { bounce: 0, duration: 2000 });
  const display = useTransform(spring, (v) =>
    v >= 1000 ? Math.round(v).toLocaleString("de-DE") : Math.round(v)
  );

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  return <motion.span>{display}</motion.span>;
}

export function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 md:py-28 bg-[#0a0a0a] relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0284c7]/5 to-transparent pointer-events-none" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Number */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <span className="text-sm font-medium tracking-widest uppercase text-[#71717a]">
            02
          </span>
          <div className="w-12 h-px bg-[#27272a] mt-4" />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.1 + index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`text-center md:text-left ${index === 2 ? "col-span-2 lg:col-span-1" : ""}`}
            >
              {stat.isNumeric ? (
                <>
                  <div className="mb-3">
                    <span className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#fafafa] tracking-tight">
                      <AnimatedNumber value={stat.value as number} isInView={isInView} />
                    </span>
                    {stat.suffix && (
                      <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0284c7]">
                        {stat.suffix}
                      </span>
                    )}
                  </div>
                  <p className="text-sm md:text-base text-[#71717a] tracking-wide">
                    {stat.label}
                  </p>
                </>
              ) : (
                <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#fafafa] tracking-tight">
                  {stat.label}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
