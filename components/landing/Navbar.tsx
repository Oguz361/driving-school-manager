"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";

const navLinks = [
  { label: "Startseite", href: "/" },
  { label: "Über uns", href: "/#ueber-uns" },
  { label: "Leistungen", href: "/#leistungen" },
  { label: "Kontakt", href: "/#kontakt" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#fafafa]/70 backdrop-blur-md border-b border-[#e4e4e7]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="group">
            <div className={`h-10 w-[140px] bg-neutral-300 dark:bg-neutral-600 rounded-md flex items-center justify-center transition-all duration-500 ${scrolled ? "drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]" : "drop-shadow-md"}`}>
              <span className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Logo</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-300 ${
                  scrolled
                    ? "text-[#71717a] hover:text-[#0284c7]"
                    : "text-white/90 hover:text-[#0284c7]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <Link
            href="/#kontakt"
            className="px-5 py-2.5 bg-[#0284c7] text-[#fafafa] text-sm font-medium rounded-full hover:bg-[#0369a1] transition-colors duration-300"
          >
            Jetzt starten
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
