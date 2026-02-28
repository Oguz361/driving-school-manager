"use client";

import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import Link from "next/link";
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconClock,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
  IconStarFilled,
} from "@tabler/icons-react";

const contactInfo = [
  {
    icon: IconMapPin,
    label: "Adresse",
    value: "STRASSE_HAUSNUMMER",
    subValue: "PLZ_STADT",
  },
  {
    icon: IconPhone,
    label: "Telefon",
    value: "TELEFONNUMMER",
    href: "tel:TELEFONNUMMER",
  },
  {
    icon: IconMail,
    label: "E-Mail",
    value: "EMAIL_ADRESSE",
    href: "mailto:EMAIL_ADRESSE",
  },
  {
    icon: IconClock,
    label: "Öffnungszeiten",
    value: "Mo–Fr 10–18 Uhr",
    subValue: "Sa 11–14 Uhr",
  },
];

export function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer id="kontakt" className="bg-[#0a0a0a] text-[#fafafa] relative overflow-hidden">
      {/* Radial Gradient Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0284c7]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Contact Section */}
      <div ref={ref} className="relative max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-medium tracking-widest uppercase text-[#71717a] block mb-4">
            Kontakt
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            So erreichst du uns
          </h2>
        </motion.div>

        {/* Contact Info Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {contactInfo.map((info, index) => (
            <motion.div
              key={info.label}
              initial={{ opacity: 0, x: -30, scale: 0.95 }}
              animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="inline-flex w-12 h-12 rounded-full border border-[#fafafa]/10 items-center justify-center mb-4">
                <info.icon size={20} className="text-[#0284c7]" strokeWidth={1.5} />
              </div>
              <p className="text-xs font-medium tracking-widest uppercase text-[#71717a] mb-2">
                {info.label}
              </p>
              {info.href ? (
                <a
                  href={info.href}
                  className="text-lg font-medium hover:text-[#0284c7] transition-colors duration-300 block"
                >
                  {info.value}
                </a>
              ) : (
                <p className="text-lg font-medium">{info.value}</p>
              )}
              {info.subValue && (
                <p className="text-[#71717a] text-sm mt-1">{info.subValue}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative rounded-2xl overflow-hidden border border-[#fafafa]/10 h-80 flex items-center justify-center bg-[#fafafa]/5"
        >
          <p className="text-[#71717a] text-sm text-center px-4">
            Google Maps Embed hier einfügen –{" "}
            <code className="text-[#0284c7]">mapEmbedUrl</code> in Footer.tsx ersetzen
          </p>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#fafafa]/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Google Rating - Links */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-[#fafafa]/10">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="relative">
                    <IconStarFilled
                      size={14}
                      className="text-[#facc15]/20"
                    />
                    <IconStarFilled
                      size={14}
                      className="absolute inset-0 text-[#facc15]"
                      style={{
                        clipPath: i < 4 ? "none" : "inset(0 10% 0 0)"
                      }}
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm font-semibold">4.9</span>
              <span className="text-xs text-[#71717a]">Google</span>
            </div>

            {/* Copyright & Legal - Mitte */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-[#71717a]">
              <p>© JAHR FAHRSCHULE_NAME</p>
              <span className="hidden sm:block w-1 h-1 bg-[#71717a]/50 rounded-full" />
              <div className="flex gap-6">
                <Link
                  href="/impressum"
                  className="hover:text-[#fafafa] transition-colors duration-300"
                >
                  Impressum
                </Link>
                <Link
                  href="/datenschutz"
                  className="hover:text-[#fafafa] transition-colors duration-300"
                >
                  Datenschutz
                </Link>
              </div>
            </div>

            {/* Social Icons - Rechts */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-[#fafafa]/10 flex items-center justify-center hover:bg-[#fafafa] hover:text-[#0a0a0a] transition-all duration-300"
                aria-label="Instagram"
              >
                <IconBrandInstagram size={18} />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-[#fafafa]/10 flex items-center justify-center hover:bg-[#fafafa] hover:text-[#0a0a0a] transition-all duration-300"
                aria-label="Facebook"
              >
                <IconBrandFacebook size={18} />
              </a>
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-[#fafafa]/10 flex items-center justify-center hover:bg-[#fafafa] hover:text-[#0a0a0a] transition-all duration-300"
                aria-label="YouTube"
              >
                <IconBrandYoutube size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
