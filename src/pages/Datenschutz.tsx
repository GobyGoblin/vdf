import { motion } from 'framer-motion';
import { MarketingLayout } from '@/components/layout';

const Datenschutz = () => {
  return (
    <MarketingLayout>
      <section className="py-20 lg:py-32 bg-card">
        <div className="container-premium">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-3xl lg:text-display-sm font-display font-bold text-foreground mb-8">
              Datenschutzerklärung
            </h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  1. Datenschutz auf einen Blick
                </h2>
                <p className="text-muted-foreground">
                  Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und Zweck
                  der Verarbeitung von personenbezogenen Daten innerhalb unserer Plattform auf.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  2. Verantwortliche Stelle
                </h2>
                <p className="text-muted-foreground">
                  VP In Deutschland GmbH<br />
                  Friedrichstraße 123<br />
                  10117 Berlin<br />
                  E-Mail: datenschutz@gbp-portal.de
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  3. Datenerfassung auf unserer Website
                </h2>
                <p className="text-muted-foreground">
                  Wir erheben personenbezogene Daten, wenn Sie sich registrieren, ein Profil
                  erstellen, Dokumente hochladen oder mit Arbeitgebern interagieren. Die
                  Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO
                  (Vertragserfüllung) und Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  4. Ihre Rechte
                </h2>
                <p className="text-muted-foreground">
                  Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung
                  der Verarbeitung Ihrer Daten. Sie können der Datenverarbeitung widersprechen
                  und haben das Recht auf Datenübertragbarkeit.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  5. Einwilligungsbasierte Datenweitergabe
                </h2>
                <p className="text-muted-foreground">
                  Ihre Kontaktdaten und Dokumente werden nur mit Ihrer ausdrücklichen
                  Einwilligung an Arbeitgeber weitergegeben. Sie können Ihre Einwilligung
                  jederzeit über Ihr Dashboard verwalten und widerrufen.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  6. Datensicherheit
                </h2>
                <p className="text-muted-foreground">
                  Wir verwenden branchenübliche Verschlüsselungstechnologien und
                  Sicherheitsmaßnahmen, um Ihre Daten zu schützen. Alle Datenübertragungen
                  erfolgen über verschlüsselte Verbindungen (SSL/TLS).
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  7. Kontakt
                </h2>
                <p className="text-muted-foreground">
                  Bei Fragen zum Datenschutz wenden Sie sich bitte an unseren
                  Datenschutzbeauftragten unter datenschutz@gbp-portal.de.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Datenschutz;
