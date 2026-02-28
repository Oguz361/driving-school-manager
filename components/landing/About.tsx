"use client";

import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import {
  IconBook,
  IconSteeringWheel,
  IconCertificate,
  IconShieldCheck,
} from "@tabler/icons-react";

const highlightItems = [
  { label: "Theorie", description: "Intensivkurse & regulär", href: "/leistungen/theoretische-ausbildung", icon: IconBook },
  { label: "Praxis", description: "Flexible Fahrstunden", href: "/leistungen/praktische-ausbildung", icon: IconSteeringWheel },
  { label: "ASF", description: "Aufbauseminare", href: "/leistungen/asf", icon: IconCertificate },
  { label: "MPU", description: "Professionelle Beratung", href: "/leistungen/mpu-vorbereitung", icon: IconShieldCheck },
];

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="ueber-uns" className="py-20 md:py-28 bg-[#fafafa] relative">
      {/* Blue accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0284c7] to-transparent opacity-30" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Number */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-sm font-medium tracking-widest uppercase text-[#71717a]">
            01
          </span>
          <div className="w-12 h-px bg-[#e4e4e7] mt-4" />
        </motion.div>

        {/* Split Layout */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Left - Title */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0a0a0a] tracking-tight leading-[1.1]">
              Über
              <br />
              uns
            </h2>

            {/* Fahrschulauto Bild */}
            <div className="mt-8 relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
              <span className="text-neutral-400 dark:text-neutral-500 text-sm font-medium">Fahrzeugbild</span>
            </div>
          </motion.div>

          {/* Divider Line - Desktop only */}
          <div className="hidden lg:flex lg:col-span-1 justify-center">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-px h-full bg-[#e4e4e7] origin-top"
            />
          </div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <h3 className="text-2xl md:text-3xl font-semibold text-[#0a0a0a] mb-6">
              Deine Fahrschule
            </h3>

            <p className="text-lg text-[#71717a] leading-relaxed mb-6">
              Wir begleiten dich von der ersten Theoriestunde bis zur bestandenen
              Prüfung. Unser erfahrenes Team aus zertifizierten Fahrlehrern steht
              dir mit Rat und Tat zur Seite.
            </p>

            <p className="text-lg text-[#71717a] leading-relaxed">
              Ob Klasse B, Motorrad oder Roller – wir bieten auch die Umschreibung
              ausländischer Führerscheine an. Zentral gelegen und
              optimal erreichbar mit U-Bahn und Bus.
            </p>

            {/* Highlight Section */}
            <div className="mt-12">
              <motion.p
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="text-xs font-medium tracking-widest uppercase text-[#71717a] mb-4"
              >
                Unsere Schwerpunkte
              </motion.p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {highlightItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={item.href}
                      className="group flex flex-col p-5 md:p-6 bg-white border border-[#e4e4e7] rounded-xl hover:border-[#0284c7] hover:shadow-[0_8px_30px_rgba(2,132,199,0.12)] transition-all duration-300"
                    >
                      {/* Icon */}
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#0284c7]/10 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-[#0284c7] transition-colors duration-300">
                        <item.icon
                          size={20}
                          className="text-[#0284c7] group-hover:text-white transition-colors duration-300"
                          strokeWidth={1.5}
                        />
                      </div>

                      {/* Label */}
                      <span className="text-sm md:text-base font-semibold text-[#0a0a0a] group-hover:text-[#0284c7] transition-colors duration-300">
                        {item.label}
                      </span>

                      {/* Description */}
                      <span className="text-xs md:text-sm text-[#71717a] mt-1">
                        {item.description}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
