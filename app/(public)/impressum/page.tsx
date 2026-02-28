import { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Impressum | FAHRSCHULE_NAME",
};

export default function ImpressumPage() {
  return (
    <LegalPageLayout title="Impressum" lastUpdated="TT. Monat JJJJ">
      {/* Angaben gemäß § 5 DDG */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          Angaben gemäß § 5 DDG
        </h2>
        <p className="text-gray-700 leading-relaxed">
          FAHRSCHULE_NAME
          <br />
          INHABER_NAME
          <br />
          STRASSE_HAUSNUMMER
          <br />
          PLZ_STADT
        </p>
      </section>

      {/* Kontakt */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">Kontakt</h2>
        <p className="text-gray-700 leading-relaxed">
          Telefon:{" "}
          <a
            href="tel:TELEFONNUMMER"
            className="text-[#0a0a0a] hover:text-[#0284c7] transition-colors"
          >
            TELEFONNUMMER
          </a>
          <br />
          E-Mail:{" "}
          <a
            href="mailto:EMAIL_ADRESSE"
            className="text-[#0a0a0a] hover:text-[#0284c7] transition-colors"
          >
            EMAIL_ADRESSE
          </a>
        </p>
      </section>

      {/* Vertreten durch */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          Vertreten durch
        </h2>
        <p className="text-gray-700 leading-relaxed">
          INHABER_NAME (Inhaber)
        </p>
      </section>

      {/* Berufsbezeichnung */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          Berufsbezeichnung & berufsrechtliche Regelungen
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Berufsbezeichnung: Fahrlehrer (verliehen in der Bundesrepublik
          Deutschland)
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          Zuständige Aufsichtsbehörde: Die für Ihren Standort zuständige
          Fahrerlaubnisbehörde (z.&nbsp;B. Straßenverkehrsamt oder Landesamt)
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          Es gelten folgende berufsrechtliche Regelungen:
          <br />
          Fahrlehrergesetz (FahrlG)
          <br />
          Einsehbar unter:{" "}
          <a
            href="https://www.gesetze-im-internet.de/fahrlg_2018/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0a0a0a] hover:text-[#0284c7] transition-colors underline"
          >
            www.gesetze-im-internet.de/fahrlg_2018
          </a>
        </p>
      </section>

      {/* EU-Streitschlichtung */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          EU-Streitschlichtung
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0a0a0a] hover:text-[#0284c7] transition-colors underline"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          Wir sind nicht bereit oder verpflichtet, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>
      </section>

      {/* Haftung für Inhalte */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          Haftung für Inhalte
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte
          auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach
          §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu
          überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
          Tätigkeit hinweisen.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
          Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
          Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der
          Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden
          von entsprechenden Rechtsverletzungen werden wir diese Inhalte
          umgehend entfernen.
        </p>
      </section>

      {/* Haftung für Links */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          Haftung für Links
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren
          Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
          fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
          verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der
          Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
          Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige
          Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch
          ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
          Bekanntwerden von Rechtsverletzungen werden wir derartige Links
          umgehend entfernen.
        </p>
      </section>

      {/* Urheberrecht */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          Urheberrecht
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
          Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
          Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der
          Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des
          jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite
          sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt
          wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden
          Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf
          eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen
          entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
          werden wir derartige Inhalte umgehend entfernen.
        </p>
      </section>
    </LegalPageLayout>
  );
}
