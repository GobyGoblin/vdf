import { motion } from 'framer-motion';
import { MarketingLayout } from '@/components/layout';

const Impressum = () => {
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
              Impressum
            </h1>

            <div className="prose prose-lg max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Angaben gemäß § 5 TMG
                </h2>
                <p className="text-muted-foreground">
                  VP In Deutschland GmbH<br />
                  Friedrichstraße 123<br />
                  10117 Berlin<br />
                  Germany
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Vertreten durch
                </h2>
                <p className="text-muted-foreground">
                  Dr. Klaus Müller (Geschäftsführer)
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Kontakt
                </h2>
                <p className="text-muted-foreground">
                  Telefon: +49 30 123 456 789<br />
                  E-Mail: info@gbp-portal.de
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Registereintrag
                </h2>
                <p className="text-muted-foreground">
                  Eintragung im Handelsregister<br />
                  Registergericht: Amtsgericht Berlin-Charlottenburg<br />
                  Registernummer: HRB 123456
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Umsatzsteuer-ID
                </h2>
                <p className="text-muted-foreground">
                  Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
                  DE 123 456 789
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
                </h2>
                <p className="text-muted-foreground">
                  Dr. Klaus Müller<br />
                  Friedrichstraße 123<br />
                  10117 Berlin
                </p>
              </section>

              <section>
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Streitschlichtung
                </h2>
                <p className="text-muted-foreground">
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung
                  (OS) bereit. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
                  vor einer Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Impressum;
