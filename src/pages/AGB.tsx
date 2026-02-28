import { motion } from 'framer-motion';
import { MarketingLayout } from '@/components/layout';

const AGB = () => {
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
              Allgemeine Geschäftsbedingungen (AGB)
            </h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  § 1 Geltungsbereich
                </h2>
                <p className="text-muted-foreground">
                  Diese Allgemeinen Geschäftsbedingungen gelten für alle Verträge zwischen
                  der VP In Deutschland GmbH und den Nutzern der Plattform, sowohl
                  für Arbeitssuchende als auch für Arbeitgeber.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  § 2 Leistungsbeschreibung
                </h2>
                <p className="text-muted-foreground">
                  Die Plattform bietet eine Vermittlungsdienstleistung zwischen verifizierten
                  internationalen Fachkräften und deutschen Arbeitgebern. Die Verifizierung
                  von Profilen und Dokumenten ist Kernbestandteil unserer Leistung.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  § 3 Registrierung und Konten
                </h2>
                <p className="text-muted-foreground">
                  Nutzer müssen sich registrieren, um die Dienste zu nutzen. Sie sind
                  verpflichtet, wahrheitsgemäße Angaben zu machen und ihre Zugangsdaten
                  geheim zu halten. Jeder Nutzer darf nur ein Konto führen.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  § 4 Einwilligung und Datenweitergabe
                </h2>
                <p className="text-muted-foreground">
                  Arbeitgeber können nur mit ausdrücklicher Einwilligung des Arbeitssuchenden
                  auf dessen vollständige Kontaktdaten und Dokumente zugreifen. Diese
                  Einwilligung kann jederzeit widerrufen werden.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  § 5 Pflichten der Nutzer
                </h2>
                <p className="text-muted-foreground">
                  Nutzer verpflichten sich, keine falschen Informationen bereitzustellen,
                  keine diskriminierenden Inhalte zu veröffentlichen und die Plattform
                  nicht für rechtswidrige Zwecke zu nutzen.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  § 6 Haftung
                </h2>
                <p className="text-muted-foreground">
                  Die VP In Deutschland GmbH haftet nicht für die Richtigkeit der von
                  Nutzern bereitgestellten Informationen, obwohl wir uns um deren Verifizierung
                  bemühen. Die Haftung ist auf vorsätzliches und grob fahrlässiges Handeln beschränkt.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  § 7 Schlussbestimmungen
                </h2>
                <p className="text-muted-foreground">
                  Es gilt deutsches Recht. Gerichtsstand ist Berlin. Sollten einzelne
                  Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der
                  übrigen Bestimmungen unberührt.
                </p>
              </section>

              <p className="text-sm text-muted-foreground mt-8">
                Stand: Januar 2025
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default AGB;
