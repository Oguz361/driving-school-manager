"use client";

import { useState } from "react";
import { TransmissionVariant } from "@/lib/services-data";
import {
  IconManualGearbox,
  IconAutomaticGearbox,
  IconSteeringWheel,
  IconCheck,
  IconX,
  IconCertificate,
  IconCar,
} from "@tabler/icons-react";

interface TransmissionVariantsProps {
  variants: TransmissionVariant[];
}

const variantIcons: Record<string, React.ReactNode> = {
  manual: <IconManualGearbox size={28} />,
  automatic: <IconAutomaticGearbox size={28} />,
  b197: <IconSteeringWheel size={28} />,
};

export function TransmissionVariants({ variants }: TransmissionVariantsProps) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id || "");
  const selectedVariant = variants.find((v) => v.id === selectedId);

  if (!selectedVariant) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-[#991b1b] rounded-full" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#0a0a0a]">
              Wähle deine Getriebeart
            </h2>
          </div>
          <p className="text-[#71717a] mb-10 ml-4">
            Jede Variante hat ihre Vorteile – wähle die passende für dich.
          </p>

          {/* Variant Tabs */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedId(variant.id)}
                className={`relative p-4 sm:p-6 rounded-2xl border-2 transition-all duration-200 text-center group ${
                  selectedId === variant.id
                    ? "border-[#0a0a0a] bg-[#0a0a0a] text-white shadow-lg"
                    : "border-[#e4e4e7] bg-white hover:border-[#0284c7] hover:shadow-md"
                }`}
              >
                <div
                  className={`mx-auto mb-2 sm:mb-3 ${
                    selectedId === variant.id
                      ? "text-white"
                      : "text-[#0a0a0a] group-hover:text-[#0284c7]"
                  } transition-colors`}
                >
                  {variantIcons[variant.id]}
                </div>
                <p
                  className={`font-semibold text-sm sm:text-base ${
                    selectedId === variant.id ? "text-white" : "text-[#0a0a0a]"
                  }`}
                >
                  {variant.shortName}
                </p>
                {selectedId === variant.id && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0a0a0a] rotate-45" />
                )}
              </button>
            ))}
          </div>

          {/* Selected Variant Details */}
          <div className="bg-white rounded-2xl border border-[#e4e4e7] overflow-hidden">
            {/* Variant Header */}
            <div className="bg-[#fafafa] p-6 border-b border-[#e4e4e7]">
              <h3 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] mb-2">
                {selectedVariant.name}
              </h3>
              <p className="text-[#71717a]">{selectedVariant.description}</p>
            </div>

            {/* Exam & Authorization Info */}
            <div className="grid sm:grid-cols-2 gap-4 p-6 border-b border-[#e4e4e7]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#0a0a0a]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconCertificate size={20} className="text-[#0a0a0a]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#71717a]">Prüfung</p>
                  <p className="text-[#0a0a0a] font-medium">
                    {selectedVariant.examType}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#0a0a0a]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconCar size={20} className="text-[#0a0a0a]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#71717a]">
                    Berechtigung
                  </p>
                  <p className="text-[#0a0a0a] font-medium">
                    {selectedVariant.authorization}
                  </p>
                </div>
              </div>
            </div>

            {/* Pros and Cons */}
            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Pros */}
              <div>
                <h4 className="font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <IconCheck size={14} className="text-green-600" />
                  </span>
                  Vorteile
                </h4>
                <ul className="space-y-3">
                  {selectedVariant.pros.map((pro, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <IconCheck
                        size={18}
                        className="text-green-500 flex-shrink-0 mt-0.5"
                      />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <h4 className="font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <IconX size={14} className="text-red-600" />
                  </span>
                  Nachteile
                </h4>
                <ul className="space-y-3">
                  {selectedVariant.cons.map((con, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <IconX
                        size={18}
                        className="text-red-400 flex-shrink-0 mt-0.5"
                      />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Info Note */}
          <p className="mt-6 text-sm text-[#71717a] text-center">
            Du bist unsicher, welche Variante für dich passt? Wir beraten dich
            gerne persönlich!
          </p>
        </div>
      </div>
    </section>
  );
}
