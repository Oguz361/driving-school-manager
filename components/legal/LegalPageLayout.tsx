import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <Navbar />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-8 bg-[#991b1b] rounded-full" />
            <h1 className="text-3xl md:text-4xl font-bold text-[#0a0a0a]">
              {title}
            </h1>
          </div>
          <p className="text-sm text-[#71717a]">
            Letzte Aktualisierung: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 pb-16">
        <div className="max-w-4xl mx-auto space-y-8">{children}</div>
      </div>

      {/* Mini Footer */}
      <div className="border-t border-[#e4e4e7] bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm">
              <Link
                href="/impressum"
                className="text-[#71717a] hover:text-[#0a0a0a] transition-colors"
              >
                Impressum
              </Link>
              <span className="text-[#e4e4e7]">|</span>
              <Link
                href="/datenschutz"
                className="text-[#71717a] hover:text-[#0a0a0a] transition-colors"
              >
                Datenschutz
              </Link>
              <span className="text-[#e4e4e7]">|</span>
              <Link
                href="/"
                className="text-[#71717a] hover:text-[#0a0a0a] transition-colors"
              >
                Startseite
              </Link>
            </div>
            <p className="text-sm text-[#71717a]">
              &copy; {new Date().getFullYear()} Meine Fahrschule
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
