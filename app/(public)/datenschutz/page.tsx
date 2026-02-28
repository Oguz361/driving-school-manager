import { Metadata } from "next";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | FAHRSCHULE_NAME",
};

export default function DatenschutzPage() {
  return (
    <LegalPageLayout
      title="Datenschutzerklärung"
      lastUpdated="TT. Monat JJJJ"
    >
      {/* Verantwortlicher */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          1. Verantwortlicher
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
        <p className="text-gray-700 leading-relaxed mt-2">
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

      {/* Überblick der Verarbeitungen */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          2. Überblick der Verarbeitungen
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Wir verarbeiten personenbezogene Daten nur, soweit dies zur
          Bereitstellung unserer Website und unserer Dienstleistungen
          erforderlich ist. Die Verarbeitung personenbezogener Daten erfolgt
          regelmäßig nur nach Einwilligung des Nutzers oder wenn die
          Verarbeitung durch gesetzliche Vorschriften gestattet ist.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          Folgende Daten werden im Rahmen der Nutzung unserer Website und
          unserer Dienstleistungen verarbeitet:
        </p>
        <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
          <li>Bestandsdaten</li>
          <li>Nutzungsdaten</li>
          <li>Ausbildungsdaten</li>
        </ul>
      </section>

      {/* Rechtsgrundlagen */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          3. Rechtsgrundlagen
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Grundlage
          folgender Rechtsgrundlagen der DSGVO:
        </p>
        <ul className="list-disc list-inside text-gray-700 mt-3 space-y-2">
          <li>
            <strong>Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</strong> – Sie
            haben Ihre Einwilligung zur Verarbeitung der Sie betreffenden
            personenbezogenen Daten gegeben (z.B. Cookie-Consent).
          </li>
          <li>
            <strong>
              Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)
            </strong>{" "}
            – Die Verarbeitung ist für die Erfüllung eines Vertrages
            erforderlich, z.B. Verwaltung der Fahrausbildung, Terminplanung,
            interne Betriebsorganisation.
          </li>
          <li>
            <strong>
              Berechtigte Interessen (Art. 6 Abs. 1 lit. f DSGVO)
            </strong>{" "}
            – Die Verarbeitung ist zur Wahrung unserer berechtigten Interessen
            erforderlich, z.B. Sicherstellung des Betriebs unserer Website,
            Schutz vor Missbrauch.
          </li>
        </ul>
      </section>

      {/* Betroffenenrechte */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          4. Ihre Rechte als betroffene Person
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie
          betreffenden personenbezogenen Daten:
        </p>
        <ul className="list-disc list-inside text-gray-700 mt-3 space-y-2">
          <li>
            <strong>Recht auf Auskunft</strong> (Art. 15 DSGVO)
          </li>
          <li>
            <strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO)
          </li>
          <li>
            <strong>Recht auf Löschung</strong> (Art. 17 DSGVO)
          </li>
          <li>
            <strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18
            DSGVO)
          </li>
          <li>
            <strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO)
          </li>
          <li>
            <strong>Recht auf Widerspruch</strong> (Art. 21 DSGVO)
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde
          über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren. Die
          zuständige Aufsichtsbehörde richtet sich nach dem Bundesland, in dem
          Ihr Unternehmen seinen Sitz hat.
        </p>
      </section>

      {/* Cookies */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">5. Cookies</h2>
        <p className="text-gray-700 leading-relaxed">
          Unsere Website verwendet ausschließlich technisch notwendige Cookies.
          Es werden keine Tracking- oder Marketing-Cookies eingesetzt.
        </p>
        <ul className="list-disc list-inside text-gray-700 mt-3 space-y-2">
          <li>
            <strong>Cookie-Consent (localStorage)</strong> – Ihre Entscheidung
            zum Cookie-Banner wird im lokalen Speicher Ihres Browsers
            gespeichert, um das Banner nicht erneut anzuzeigen. Hierbei handelt
            es sich nicht um ein Cookie im technischen Sinne.
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-2">
          Rechtsgrundlage für die Verwendung technisch notwendiger Cookies ist
          Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) in Verbindung mit
          § 25 Abs. 2 TTDSG.
        </p>
      </section>

      {/* Fahrschülerdaten */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          6. Verarbeitung von Fahrschülerdaten
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Im Rahmen der Fahrausbildung werden personenbezogene Daten
          von Fahrschülern erhoben und verarbeitet.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          Folgende Daten werden verarbeitet:
        </p>
        <ul className="list-disc list-inside text-gray-700 mt-3 space-y-1">
          <li>Vor- und Nachname</li>
          <li>Geburtsdatum</li>
          <li>Zuständige Prüforganisation (z.B. TÜV, DEKRA)</li>
          <li>Fahrstundenverlauf und Terminplanung</li>
          <li>Zahlungsstatus</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-2">
          Zweck der Verarbeitung ist die Organisation und Durchführung der
          Fahrausbildung.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung –
          Ausbildungsvertrag zwischen Fahrschule und Fahrschüler).
        </p>
      </section>

      {/* Hosting */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">7. Hosting</h2>
        <p className="text-gray-700 leading-relaxed">
          Unsere Website wird bei Vercel Inc. gehostet. Beim Aufruf unserer
          Website werden automatisch Informationen in sogenannten
          Server-Log-Dateien gespeichert, die Ihr Browser automatisch
          übermittelt:
        </p>
        <ul className="list-disc list-inside text-gray-700 mt-3 space-y-1">
          <li>IP-Adresse des anfragenden Rechners</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>Name und URL der abgerufenen Datei</li>
          <li>Referrer-URL (zuvor besuchte Seite)</li>
          <li>
            Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-2">
          Anbieter: Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
          USA. Vercel ist unter dem EU-US Data Privacy Framework zertifiziert.
        </p>
        <p className="text-gray-700 leading-relaxed mt-2">
          Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
          an einer stabilen und sicheren Bereitstellung der Website).
        </p>
      </section>

      {/* Externe Links & Social Media */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          8. Externe Links & Social Media
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Unsere Website enthält Links zu unseren Social-Media-Profilen auf
          folgenden Plattformen:
        </p>
        <ul className="list-disc list-inside text-gray-700 mt-3 space-y-1">
          <li>Facebook (Meta Platforms Ireland Ltd.)</li>
          <li>YouTube (Google Ireland Ltd.)</li>
          <li>Instagram (Meta Platforms Ireland Ltd.)</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-2">
          Es handelt sich hierbei ausschließlich um einfache Verlinkungen
          (Hyperlinks). Es werden keine Social-Media-Plugins oder Embeds
          eingebunden, die bereits beim Seitenaufruf Daten an die jeweiligen
          Plattformen übertragen. Erst wenn Sie auf einen Link klicken und die
          externe Seite besuchen, gelten die Datenschutzbestimmungen des
          jeweiligen Anbieters.
        </p>
      </section>

      {/* SSL/TLS-Verschlüsselung */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          9. SSL/TLS-Verschlüsselung
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Diese Seite nutzt aus Sicherheitsgründen eine SSL- bzw.
          TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie
          daran, dass die Adresszeile des Browsers von &quot;http://&quot; auf
          &quot;https://&quot; wechselt und an dem Schloss-Symbol in Ihrer
          Browserzeile.
        </p>
      </section>

      {/* Änderungen */}
      <section className="bg-[#fafafa] rounded-xl p-6 border border-[#e4e4e7]">
        <h2 className="text-xl font-bold text-[#0a0a0a] mb-4">
          10. Änderungen dieser Datenschutzerklärung
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie
          stets den aktuellen rechtlichen Anforderungen entspricht oder um
          Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen,
          z.B. bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt
          dann die neue Datenschutzerklärung.
        </p>
      </section>
    </LegalPageLayout>
  );
}
