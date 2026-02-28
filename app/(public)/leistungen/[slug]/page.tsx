import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getServiceBySlug, getServiceSlugs } from "@/lib/services-data";
import {
  IconCheck,
  IconPhone,
  IconMail,
  IconCalendar,
  IconBook,
  IconCar,
  IconCertificate,
} from "@tabler/icons-react";
import { Navbar } from "@/components/landing/Navbar";
import { ServiceHero } from "./ServiceHero";
import { FAQAccordion } from "./FAQAccordion";
import { TransmissionVariants } from "./TransmissionVariants";

// Generate static params for all services
export async function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    return { title: "Nicht gefunden" };
  }

  return {
    title: `${service.name} | Meine Fahrschule`,
    description: service.overview.slice(0, 160),
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <div className="pt-20">
        <ServiceHero service={service} />
      </div>

      {/* Quick Stats */}
      <section className="py-12 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-[#e4e4e7] text-center">
              <IconCalendar size={28} className="mx-auto mb-3 text-[#0284c7]" />
              <p className="text-2xl font-bold text-[#0a0a0a]">
                {service.requirements.minAgeShort ?? service.requirements.minAge.split(" ")[0]}
              </p>
              <p className="text-sm text-[#71717a]">Mindestalter</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#e4e4e7] text-center">
              <IconBook size={28} className="mx-auto mb-3 text-[#0284c7]" />
              <p className="text-2xl font-bold text-[#0a0a0a]">
                {service.training.theoryHours} Std
              </p>
              <p className="text-sm text-[#71717a]">Theorie</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-[#e4e4e7] text-center">
              <IconCar size={28} className="mx-auto mb-3 text-[#0284c7]" />
              <p className="text-2xl font-bold text-[#0a0a0a]">
                {service.training.practiceLabel ?? (service.training.practiceHours > 0
                  ? `~${service.training.practiceHours} Std`
                  : "–")}
              </p>
              <p className="text-sm text-[#71717a]">Praxis</p>
            </div>
          </div>
        </div>
      </section>

      {/* Transmission Variants Section (only for Class B licenses) */}
      {service.transmissionVariants && service.transmissionVariants.length > 0 && (
        <TransmissionVariants variants={service.transmissionVariants} />
      )}

      {/* Requirements Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-[#991b1b] rounded-full" />
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a0a0a]">
                Voraussetzungen
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Age & Prerequisites */}
              <div className="space-y-6">
                <div className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
                  <h3 className="font-semibold text-[#0a0a0a] mb-2">
                    Mindestalter
                  </h3>
                  <p className="text-[#71717a]">{service.requirements.minAge}</p>
                </div>

                {service.requirements.prerequisites && (
                  <div className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
                    <h3 className="font-semibold text-[#0a0a0a] mb-2">
                      Besondere Voraussetzungen
                    </h3>
                    <p className="text-[#71717a]">
                      {service.requirements.prerequisites}
                    </p>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div className="bg-[#0a0a0a] rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-4">Benötigte Unterlagen</h3>
                <ul className="space-y-3">
                  {service.requirements.documents.map((doc, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <IconCheck
                        size={20}
                        className="text-[#0284c7] flex-shrink-0 mt-0.5"
                      />
                      <span className="text-white/90">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training Process Timeline */}
      <section className="py-16 md:py-24 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-1 h-8 bg-[#991b1b] rounded-full" />
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a0a0a]">
                Ausbildungsablauf
              </h2>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#e4e4e7] hidden md:block" />

              {/* Steps */}
              <div className="space-y-8">
                {/* Step 1: Theory */}
                <div className="relative flex gap-6">
                  <div className="hidden md:flex w-12 h-12 bg-[#0a0a0a] rounded-full items-center justify-center text-white font-bold text-lg flex-shrink-0 z-10">
                    1
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-6 border border-[#e4e4e7]">
                    <div className="md:hidden w-8 h-8 bg-[#0a0a0a] rounded-full flex items-center justify-center text-white font-bold text-sm mb-3">
                      1
                    </div>
                    <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">
                      Theoretische Ausbildung
                    </h3>
                    <p className="text-[#71717a] mb-3">
                      {service.training.theoryHours > 0
                        ? `${service.training.theoryHours} Unterrichtseinheiten à 90 Minuten`
                        : "Individuelle Beratung und Vorbereitung"}
                    </p>
                    {service.category === "license" && (
                      <p className="text-sm text-[#71717a]">
                        Regelmäßiger Unterricht in unserer Fahrschule. Du lernst
                        Verkehrsregeln, Verkehrszeichen und richtiges Verhalten
                        im Straßenverkehr.
                      </p>
                    )}
                  </div>
                </div>

                {/* Step 2: Practice */}
                {service.training.practiceHours > 0 && (
                  <div className="relative flex gap-6">
                    <div className="hidden md:flex w-12 h-12 bg-[#0a0a0a] rounded-full items-center justify-center text-white font-bold text-lg flex-shrink-0 z-10">
                      2
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-6 border border-[#e4e4e7]">
                      <div className="md:hidden w-8 h-8 bg-[#0a0a0a] rounded-full flex items-center justify-center text-white font-bold text-sm mb-3">
                        2
                      </div>
                      <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">
                        Praktische Ausbildung
                      </h3>
                      <p className="text-[#71717a] mb-3">
                        {service.training.practiceLabel ?? `Ca. ${service.training.practiceHours} Fahrstunden à 45 Minuten`}
                      </p>
                      {service.training.specialDrives && (
                        <div className="mt-4 pt-4 border-t border-[#e4e4e7]">
                          <p className="text-sm font-medium text-[#0a0a0a] mb-2">
                            Davon Sonderfahrten:
                          </p>
                          <ul className="space-y-1">
                            {service.training.specialDrives.map(
                              (drive, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-[#71717a] flex items-center gap-2"
                                >
                                  <span className="w-1.5 h-1.5 bg-[#991b1b] rounded-full" />
                                  {drive}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Exam */}
                <div className="relative flex gap-6">
                  <div className="hidden md:flex w-12 h-12 bg-[#991b1b] rounded-full items-center justify-center text-white font-bold text-lg flex-shrink-0 z-10">
                    <IconCertificate size={24} />
                  </div>
                  <div className="flex-1 bg-white rounded-xl p-6 border border-[#e4e4e7]">
                    <div className="md:hidden w-8 h-8 bg-[#991b1b] rounded-full flex items-center justify-center text-white mb-3">
                      <IconCertificate size={16} />
                    </div>
                    <h3 className="text-xl font-bold text-[#0a0a0a] mb-2">
                      Prüfung & Abschluss
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-sm font-medium text-[#71717a] mb-1">
                          Theorieprüfung
                        </p>
                        <p className="text-[#71717a]">{service.exam.theory}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#71717a] mb-1">
                          Praktische Prüfung
                        </p>
                        <p className="text-[#71717a]">{service.exam.practice}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Included Services */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-[#991b1b] rounded-full" />
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a0a0a]">
                Das ist inklusive
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {service.includedServices.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-[#fafafa] rounded-xl border border-[#e4e4e7]"
                >
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <IconCheck size={14} className="text-green-600" />
                  </div>
                  <span className="text-[#71717a]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-[#991b1b] rounded-full" />
              <h2 className="text-3xl md:text-4xl font-bold text-[#0a0a0a]">
                Häufige Fragen
              </h2>
            </div>

            <FAQAccordion faq={service.faq} />
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 md:py-24 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Bereit für deinen {service.name}?
            </h2>
            <p className="text-lg text-white/70 mb-8">
              Lass dich kostenlos und unverbindlich beraten. Wir freuen uns auf
              dich!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:TELEFONNUMMER"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#991b1b] text-white font-semibold rounded-xl hover:bg-[#7f1d1d] transition-colors"
              >
                <IconPhone size={20} />
                TELEFONNUMMER
              </a>
              <a
                href="mailto:EMAIL_ADRESSE"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
              >
                <IconMail size={20} />
                E-Mail schreiben
              </a>
            </div>

            <p className="mt-8 text-sm text-white/50">
              STRASSE_HAUSNUMMER, PLZ_STADT • Mo–Fr 10–18 Uhr, Sa 11–14 Uhr
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
