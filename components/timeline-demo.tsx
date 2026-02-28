"use client";

import React from "react";
import { Timeline } from "@/components/ui/timeline";
import {
  IconBook,
  IconSteeringWheel,
  IconCertificate,
  IconCheck,
} from "@tabler/icons-react";

export default function TimelineDemo() {
  const data = [
    {
      title: "Schritt 1",
      content: (
        <div>
          <h4 className="text-xl md:text-2xl font-semibold text-[#0a0a0a] mb-4">
            Anmeldung & Beratung
          </h4>
          <p className="mb-6 text-sm md:text-base text-[#71717a] leading-relaxed">
            Komm bei uns vorbei oder melde dich online an. In einem persönlichen
            Beratungsgespräch klären wir deine Wünsche, die passende
            Führerscheinklasse und den optimalen Ausbildungsplan.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-[#71717a]">
              <div className="w-6 h-6 rounded-full bg-[#0284c7]/10 flex items-center justify-center flex-shrink-0">
                <IconCheck size={14} className="text-[#0284c7]" />
              </div>
              Kostenlose Erstberatung
            </div>
            <div className="flex items-center gap-3 text-sm text-[#71717a]">
              <div className="w-6 h-6 rounded-full bg-[#0284c7]/10 flex items-center justify-center flex-shrink-0">
                <IconCheck size={14} className="text-[#0284c7]" />
              </div>
              Individuelle Preisübersicht
            </div>
            <div className="flex items-center gap-3 text-sm text-[#71717a]">
              <div className="w-6 h-6 rounded-full bg-[#0284c7]/10 flex items-center justify-center flex-shrink-0">
                <IconCheck size={14} className="text-[#0284c7]" />
              </div>
              Flexible Zahlungsmöglichkeiten
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Schritt 2",
      content: (
        <div>
          <h4 className="text-xl md:text-2xl font-semibold text-[#0a0a0a] mb-4">
            Theoretische Ausbildung
          </h4>
          <p className="mb-6 text-sm md:text-base text-[#71717a] leading-relaxed">
            In unseren modernen Unterrichtsräumen am Kottbusser Tor lernst du
            alles, was du für die Theorieprüfung brauchst. Wähle zwischen
            regulären Kursen oder Intensivkursen.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-[#fafafa] border border-[#e4e4e7] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#0284c7]/10 flex items-center justify-center mb-3">
                <IconBook size={20} className="text-[#0284c7]" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-[#0a0a0a] mb-1">
                Regulärer Kurs
              </p>
              <p className="text-xs text-[#71717a]">
                2x pro Woche, abends
              </p>
            </div>
            <div className="p-5 bg-[#fafafa] border border-[#e4e4e7] rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-[#0284c7]/10 flex items-center justify-center mb-3">
                <IconBook size={20} className="text-[#0284c7]" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-semibold text-[#0a0a0a] mb-1">
                Intensivkurs
              </p>
              <p className="text-xs text-[#71717a]">
                1 Woche, täglich
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Schritt 3",
      content: (
        <div>
          <h4 className="text-xl md:text-2xl font-semibold text-[#0a0a0a] mb-4">
            Praktische Fahrstunden
          </h4>
          <p className="mb-6 text-sm md:text-base text-[#71717a] leading-relaxed">
            Mit unseren erfahrenen Fahrlehrern und modernen Fahrzeugen lernst du
            sicher fahren. Die Termine planst du flexibel nach deinem Zeitplan.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-[#71717a]">
              <div className="w-6 h-6 rounded-full bg-[#0284c7]/10 flex items-center justify-center flex-shrink-0">
                <IconSteeringWheel size={14} className="text-[#0284c7]" />
              </div>
              Übungsfahrten in Kreuzberg & Umgebung
            </div>
            <div className="flex items-center gap-3 text-sm text-[#71717a]">
              <div className="w-6 h-6 rounded-full bg-[#0284c7]/10 flex items-center justify-center flex-shrink-0">
                <IconSteeringWheel size={14} className="text-[#0284c7]" />
              </div>
              Sonderfahrten (Autobahn, Nacht, Überland)
            </div>
            <div className="flex items-center gap-3 text-sm text-[#71717a]">
              <div className="w-6 h-6 rounded-full bg-[#0284c7]/10 flex items-center justify-center flex-shrink-0">
                <IconSteeringWheel size={14} className="text-[#0284c7]" />
              </div>
              Prüfungsvorbereitung & Probeprüfung
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Schritt 4",
      content: (
        <div>
          <h4 className="text-xl md:text-2xl font-semibold text-[#0a0a0a] mb-4">
            Prüfung & Führerschein
          </h4>
          <p className="mb-6 text-sm md:text-base text-[#71717a] leading-relaxed">
            Wir melden dich zur Prüfung an und begleiten dich bis zum Schluss.
            Nach bestandener Prüfung hältst du deinen Führerschein in den Händen.
          </p>
          <div className="p-6 bg-[#0284c7]/5 border border-[#0284c7]/20 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-[#0284c7]/10 flex items-center justify-center mb-4">
              <IconCertificate size={24} className="text-[#0284c7]" strokeWidth={1.5} />
            </div>
            <p className="text-base font-semibold text-[#0a0a0a] mb-2">
              Hohe Bestehensquote
            </p>
            <p className="text-sm text-[#71717a] leading-relaxed">
              Dank unserer gründlichen Vorbereitung bestehen die meisten unserer
              Fahrschüler die Prüfung beim ersten Anlauf.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="ablauf" className="py-32 md:py-40 bg-white relative">
      <div className="relative w-full overflow-clip">
        <Timeline
          data={data}
          title={
            <div className="mb-4">
              <span className="text-sm font-medium tracking-widest uppercase text-[#71717a] block mb-4">
                05
              </span>
              <div className="w-12 h-px bg-[#e4e4e7] mb-8" />
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0a0a0a] tracking-tight">
                Dein Weg zum Führerschein
              </h2>
            </div>
          }
          description={
            <p className="text-lg text-[#71717a] max-w-md mt-4">
              In vier einfachen Schritten begleiten wir dich von der Anmeldung bis zur bestandenen Prüfung.
            </p>
          }
        />
      </div>
    </section>
  );
}
