import React from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { ArrowLeft } from "lucide-react";

type LegalDocKey =
  | "terms"
  | "agb"
  | "privacy"
  | "cookies"
  | "disclaimer"
  | "impressum";

type LegalDoc = {
  title: string;
  subtitle: string;
  content: JSX.Element;
};

type LegalLocaleCopy = {
  backToLanding: string;
  updatedAtLabel: string;
  updatedAt: string;
  nav: Record<LegalDocKey, string>;
  docs: Record<LegalDocKey, LegalDoc>;
};

const legalCopyByLang: Record<"es" | "en" | "de", LegalLocaleCopy> = {
  es: {
    backToLanding: "Volver a landing",
    updatedAtLabel: "Última actualización",
    updatedAt: "17 de febrero de 2026",
    nav: {
      terms: "Términos",
      agb: "AGB",
      privacy: "Privacidad",
      cookies: "Cookies",
      disclaimer: "Descargo",
      impressum: "Impressum",
    },
    docs: {
      terms: {
        title: "Términos y Condiciones de Uso",
        subtitle:
          "Regulan el acceso y uso de Remi por parte de cualquier usuario.",
        content: (
          <>
            <h2>1. Objeto</h2>
            <p>
              Estos Términos regulan el uso de la aplicación y servicios digitales de
              Remi (el “Servicio”).
            </p>
            <h2>2. Elegibilidad y cuenta</h2>
            <p>
              El usuario es responsable de la veracidad de sus datos, de mantener su
              cuenta segura y de la actividad realizada con sus credenciales.
            </p>
            <h2>3. Uso permitido y prohibido</h2>
            <p>
              El Servicio debe usarse de forma lícita y diligente. Queda prohibido su uso
              para fraude, spam, actividades ilícitas o vulneración de derechos de
              terceros.
            </p>
            <h2>4. Propiedad intelectual</h2>
            <p>
              El software, marca y contenidos propios de Remi están protegidos por
              normativa de propiedad intelectual e industrial.
            </p>
            <h2>5. Disponibilidad y cambios</h2>
            <p>
              Remi puede actualizar funciones, realizar mantenimiento o modificar aspectos
              técnicos para mejorar el Servicio.
            </p>
            <h2>6. Ley aplicable</h2>
            <p>
              Se aplicará la normativa vigente según la jurisdicción competente y las
              reglas de consumo y comercio electrónico aplicables.
            </p>
          </>
        ),
      },
      agb: {
        title: "AGB (Condiciones Generales)",
        subtitle:
          "Condiciones generales para planes o funcionalidades de pago, cuando apliquen.",
        content: (
          <>
            <h2>1. Ámbito</h2>
            <p>
              Estas condiciones se aplican a la contratación y uso de modalidades de pago
              de Remi.
            </p>
            <h2>2. Contratación y pago</h2>
            <p>
              La contratación se perfecciona con la confirmación del pedido y, cuando
              proceda, con la autorización del pago.
            </p>
            <h2>3. Renovación y cancelación</h2>
            <p>
              Salvo indicación en contrario, las suscripciones se renuevan automáticamente
              por periodos equivalentes hasta su cancelación.
            </p>
            <h2>4. Incidencias e incumplimiento</h2>
            <p>
              El impago, fraude o incumplimiento relevante puede dar lugar a suspensión
              temporal o resolución del servicio.
            </p>
          </>
        ),
      },
      privacy: {
        title: "Política de Privacidad y Protección de Datos",
        subtitle:
          "Tratamiento de datos personales conforme a normativa aplicable.",
        content: (
          <>
            <h2>1. Responsable</h2>
            <p>
              Responsable: <strong>Jobsaun</strong>.
              <br />
              Contacto: <strong>jobsaun20@gmail.com</strong>.
            </p>
            <h2>2. Datos tratados</h2>
            <p>
              Datos de cuenta, datos de uso y contenido que el usuario guarda en Remi
              (tareas, ideas, recordatorios), además de datos técnicos de seguridad.
            </p>
            <h2>3. Finalidad y base jurídica</h2>
            <p>
              Prestación del servicio, autenticación, sincronización, soporte, seguridad y
              mejora del producto, con base en contrato, interés legítimo o consentimiento.
            </p>
            <h2>4. Conservación y destinatarios</h2>
            <p>
              Los datos se conservan durante la relación de uso y plazos legales. Pueden
              intervenir proveedores tecnológicos bajo acuerdos de tratamiento.
            </p>
            <h2>5. Derechos</h2>
            <p>
              El usuario puede ejercer acceso, rectificación, supresión, oposición,
              limitación y portabilidad, conforme a la normativa aplicable.
            </p>
          </>
        ),
      },
      cookies: {
        title: "Política de Cookies",
        subtitle:
          "Información sobre cookies y tecnologías equivalentes usadas en Remi.",
        content: (
          <>
            <h2>1. Qué son</h2>
            <p>
              Las cookies son archivos/identificadores que ayudan a reconocer el
              dispositivo y mejorar la experiencia de uso.
            </p>
            <h2>2. Tipos y finalidad</h2>
            <p>
              Remi puede usar cookies técnicas, de preferencia y analíticas para operar,
              recordar ajustes y mejorar el servicio.
            </p>
            <h2>3. Control del usuario</h2>
            <p>
              El usuario puede aceptar, rechazar o configurar cookies desde su navegador y
              herramientas de consentimiento disponibles.
            </p>
          </>
        ),
      },
      disclaimer: {
        title: "Descargo de Responsabilidad",
        subtitle:
          "Alcance del servicio y responsabilidad del usuario en el uso de Remi.",
        content: (
          <>
            <h2>1. Naturaleza de Remi</h2>
            <p>
              Remi es una herramienta digital de apoyo para organización personal y
              recordatorios.
            </p>
            <h2>2. Responsabilidad del usuario</h2>
            <p>
              Remi es solo una herramienta. El uso adecuado, la revisión de fechas,
              prioridades y configuración de avisos es responsabilidad exclusiva del
              usuario.
            </p>
            <h2>3. Sin garantía absoluta</h2>
            <p>
              No se garantiza disponibilidad ininterrumpida ni entrega total de
              notificaciones, ya que intervienen factores técnicos externos.
            </p>
            <h2>4. Uso no crítico</h2>
            <p>
              No debe emplearse como único sistema para obligaciones críticas (médicas,
              legales, financieras, seguridad o emergencias).
            </p>
          </>
        ),
      },
      impressum: {
        title: "Impressum (Suiza)",
        subtitle:
          "Información del prestador conforme a requisitos de transparencia en Suiza.",
        content: (
          <>
            <h2>1. Titular del servicio</h2>
            <p>
              Responsable: <strong>Jobsaun</strong>.
              <br />
              Contacto: <strong>jobsaun20@gmail.com</strong>.
            </p>
            <h2>2. Actividad</h2>
            <p>
              Remi es una aplicación digital para organización personal y gestión de
              recordatorios.
            </p>
            <h2>3. Marco suizo</h2>
            <p>
              Esta información se publica conforme a obligaciones de transparencia en el
              comercio electrónico suizo (incluyendo criterios UWG).
            </p>
          </>
        ),
      },
    },
  },
  en: {
    backToLanding: "Back to landing",
    updatedAtLabel: "Last updated",
    updatedAt: "February 17, 2026",
    nav: {
      terms: "Terms",
      agb: "AGB",
      privacy: "Privacy",
      cookies: "Cookies",
      disclaimer: "Disclaimer",
      impressum: "Impressum",
    },
    docs: {
      terms: {
        title: "Terms and Conditions of Use",
        subtitle: "These terms govern access to and use of Remi.",
        content: (
          <>
            <h2>1. Scope</h2>
            <p>
              These Terms govern use of Remi digital services (the “Service”).
            </p>
            <h2>2. Account responsibility</h2>
            <p>
              Users are responsible for accurate registration data, account security, and
              all activity under their credentials.
            </p>
            <h2>3. Permitted and prohibited use</h2>
            <p>
              The Service must be used lawfully. Fraud, spam, abuse, and unlawful activity
              are prohibited.
            </p>
            <h2>4. Intellectual property</h2>
            <p>
              Remi software, branding, and proprietary content are protected by applicable
              intellectual property laws.
            </p>
            <h2>5. Service updates</h2>
            <p>
              Remi may perform maintenance and update features to improve reliability and
              functionality.
            </p>
          </>
        ),
      },
      agb: {
        title: "AGB (General Terms)",
        subtitle: "General terms for paid plans/features where applicable.",
        content: (
          <>
            <h2>1. Applicability</h2>
            <p>
              These AGB apply to paid subscriptions and paid service features of Remi.
            </p>
            <h2>2. Contract and payment</h2>
            <p>
              A contract is formed when the user confirms the order and payment is
              authorized, where applicable.
            </p>
            <h2>3. Renewal and cancellation</h2>
            <p>
              Unless stated otherwise, subscriptions renew automatically until canceled.
            </p>
            <h2>4. Breach</h2>
            <p>
              Non-payment, fraud, or material breach may lead to suspension or termination.
            </p>
          </>
        ),
      },
      privacy: {
        title: "Privacy Policy",
        subtitle: "How personal data is processed under applicable laws.",
        content: (
          <>
            <h2>1. Data controller</h2>
            <p>
              Controller: <strong>Jobsaun</strong>.
              <br />
              Contact: <strong>jobsaun20@gmail.com</strong>.
            </p>
            <h2>2. Data categories</h2>
            <p>
              Account data, service usage data, and user content stored in Remi (tasks,
              ideas, reminders), plus technical/security logs.
            </p>
            <h2>3. Purposes and legal basis</h2>
            <p>
              Service delivery, authentication, sync, support, security, and product
              improvement, based on contract, legitimate interest, or consent.
            </p>
            <h2>4. Retention and processors</h2>
            <p>
              Data is retained while needed for service/legal obligations. Technology
              providers may process data under proper processing agreements.
            </p>
            <h2>5. User rights</h2>
            <p>
              Users may request access, rectification, erasure, objection, restriction, and
              portability as provided by law.
            </p>
          </>
        ),
      },
      cookies: {
        title: "Cookie Policy",
        subtitle: "Information about cookies and similar technologies used by Remi.",
        content: (
          <>
            <h2>1. What cookies are</h2>
            <p>
              Cookies are identifiers that help recognize a browser/device and improve user
              experience.
            </p>
            <h2>2. Types and purpose</h2>
            <p>
              Remi may use technical, preference, and analytics cookies to operate and
              improve the Service.
            </p>
            <h2>3. User control</h2>
            <p>
              Users can accept, reject, or configure cookies through browser settings and
              available consent controls.
            </p>
          </>
        ),
      },
      disclaimer: {
        title: "Disclaimer",
        subtitle: "Service limitations and user responsibility.",
        content: (
          <>
            <h2>1. Nature of the Service</h2>
            <p>
              Remi is a digital support tool for personal organization and reminders.
            </p>
            <h2>2. User responsibility</h2>
            <p>
              Remi is only a tool. Proper usage, including reviewing dates, priorities, and
              notification settings, is the sole responsibility of the user.
            </p>
            <h2>3. No absolute guarantee</h2>
            <p>
              Remi cannot guarantee uninterrupted availability or 100% notification
              delivery due to external technical factors.
            </p>
            <h2>4. Non-critical use</h2>
            <p>
              Remi must not be used as the only system for critical obligations (medical,
              legal, financial, security, or emergency matters).
            </p>
          </>
        ),
      },
      impressum: {
        title: "Impressum (Switzerland)",
        subtitle:
          "Provider information in line with transparency expectations in Switzerland.",
        content: (
          <>
            <h2>1. Service provider</h2>
            <p>
              Responsible party: <strong>Jobsaun</strong>.
              <br />
              Contact: <strong>jobsaun20@gmail.com</strong>.
            </p>
            <h2>2. Business activity</h2>
            <p>
              Remi is a digital product for personal organization and reminder management.
            </p>
            <h2>3. Swiss transparency context</h2>
            <p>
              This provider information is published in accordance with Swiss e-commerce
              transparency expectations, including UWG-related standards.
            </p>
          </>
        ),
      },
    },
  },
  de: {
    backToLanding: "Zurück zur Landing",
    updatedAtLabel: "Letzte Aktualisierung",
    updatedAt: "17. Februar 2026",
    nav: {
      terms: "Nutzungsbedingungen",
      agb: "AGB",
      privacy: "Datenschutz",
      cookies: "Cookies",
      disclaimer: "Haftungsausschluss",
      impressum: "Impressum",
    },
    docs: {
      terms: {
        title: "Nutzungsbedingungen",
        subtitle: "Regeln für den Zugriff und die Nutzung von Remi.",
        content: (
          <>
            <h2>1. Geltungsbereich</h2>
            <p>
              Diese Bedingungen regeln die Nutzung der digitalen Dienste von Remi.
            </p>
            <h2>2. Konto und Verantwortung</h2>
            <p>
              Nutzer sind für korrekte Registrierungsdaten, Kontosicherheit und Aktivitäten
              unter ihren Zugangsdaten verantwortlich.
            </p>
            <h2>3. Zulässige und unzulässige Nutzung</h2>
            <p>
              Der Dienst ist rechtmäßig und sorgfältig zu nutzen. Missbrauch, Betrug, Spam
              und rechtswidrige Nutzung sind untersagt.
            </p>
            <h2>4. Geistiges Eigentum</h2>
            <p>
              Software, Marke und proprietäre Inhalte von Remi sind rechtlich geschützt.
            </p>
            <h2>5. Änderungen am Dienst</h2>
            <p>
              Remi kann Funktionen und technische Aspekte zur Verbesserung des Dienstes
              aktualisieren.
            </p>
          </>
        ),
      },
      agb: {
        title: "AGB",
        subtitle:
          "Allgemeine Bedingungen für kostenpflichtige Pläne/Funktionen, sofern anwendbar.",
        content: (
          <>
            <h2>1. Anwendungsbereich</h2>
            <p>
              Diese AGB gelten für kostenpflichtige Abos und Funktionen von Remi.
            </p>
            <h2>2. Vertrag und Zahlung</h2>
            <p>
              Ein Vertrag kommt mit Bestellbestätigung und ggf. Zahlungsfreigabe zustande.
            </p>
            <h2>3. Verlängerung und Kündigung</h2>
            <p>
              Sofern nicht anders angegeben, verlängern sich Abos automatisch bis zur
              Kündigung.
            </p>
            <h2>4. Pflichtverletzung</h2>
            <p>
              Bei Nichtzahlung, Betrug oder erheblichem Verstoß kann der Zugang gesperrt
              oder beendet werden.
            </p>
          </>
        ),
      },
      privacy: {
        title: "Datenschutzerklärung",
        subtitle:
          "Informationen zur Verarbeitung personenbezogener Daten nach geltendem Recht.",
        content: (
          <>
            <h2>1. Verantwortliche Stelle</h2>
            <p>
              Verantwortlich: <strong>Jobsaun</strong>.
              <br />
              Kontakt: <strong>jobsaun20@gmail.com</strong>.
            </p>
            <h2>2. Verarbeitete Daten</h2>
            <p>
              Kontodaten, Nutzungsdaten sowie in Remi gespeicherte Inhalte (Aufgaben,
              Ideen, Erinnerungen), plus technische Sicherheitsdaten.
            </p>
            <h2>3. Zwecke und Rechtsgrundlagen</h2>
            <p>
              Bereitstellung des Dienstes, Authentifizierung, Synchronisierung, Support,
              Sicherheit und Produktverbesserung auf Basis von Vertrag, berechtigtem
              Interesse oder Einwilligung.
            </p>
            <h2>4. Speicherdauer und Empfänger</h2>
            <p>
              Daten werden nur so lange gespeichert, wie es für den Dienst oder gesetzliche
              Pflichten erforderlich ist. Technische Dienstleister können als
              Auftragsverarbeiter eingebunden sein.
            </p>
            <h2>5. Betroffenenrechte</h2>
            <p>
              Nutzer können Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch
              und Übertragbarkeit im gesetzlichen Rahmen verlangen.
            </p>
          </>
        ),
      },
      cookies: {
        title: "Cookie-Richtlinie",
        subtitle:
          "Informationen über Cookies und ähnliche Technologien bei Remi.",
        content: (
          <>
            <h2>1. Was Cookies sind</h2>
            <p>
              Cookies sind Kennungen, die Browser/Geräte wiedererkennen und die Nutzung
              verbessern.
            </p>
            <h2>2. Arten und Zweck</h2>
            <p>
              Remi kann technische, Präferenz- und Analyse-Cookies einsetzen, um den Dienst
              zu betreiben und zu verbessern.
            </p>
            <h2>3. Steuerung durch Nutzer</h2>
            <p>
              Nutzer können Cookies über Browser-Einstellungen und verfügbare
              Einwilligungsoptionen steuern.
            </p>
          </>
        ),
      },
      disclaimer: {
        title: "Haftungsausschluss",
        subtitle: "Grenzen des Dienstes und Verantwortung der Nutzer.",
        content: (
          <>
            <h2>1. Art des Dienstes</h2>
            <p>
              Remi ist ein digitales Hilfsmittel für persönliche Organisation und
              Erinnerungen.
            </p>
            <h2>2. Nutzerverantwortung</h2>
            <p>
              Remi ist nur ein Werkzeug. Die korrekte Nutzung, Prüfung von Terminen und
              Prioritäten sowie die richtige Benachrichtigungskonfiguration liegen in der
              alleinigen Verantwortung der Nutzer.
            </p>
            <h2>3. Keine absolute Garantie</h2>
            <p>
              Eine ununterbrochene Verfügbarkeit oder lückenlose Zustellung von
              Benachrichtigungen kann aufgrund externer technischer Faktoren nicht
              garantiert werden.
            </p>
            <h2>4. Kein Einsatz als einziges kritisches System</h2>
            <p>
              Remi darf nicht als einziges System für kritische Pflichten (medizinisch,
              rechtlich, finanziell, Sicherheit, Notfall) verwendet werden.
            </p>
          </>
        ),
      },
      impressum: {
        title: "Impressum (Schweiz)",
        subtitle:
          "Anbieterinformationen gemäss Transparenzanforderungen in der Schweiz.",
        content: (
          <>
            <h2>1. Diensteanbieter</h2>
            <p>
              Verantwortlich: <strong>Jobsaun</strong>.
              <br />
              Kontakt: <strong>jobsaun20@gmail.com</strong>.
            </p>
            <h2>2. Tätigkeit</h2>
            <p>
              Remi ist ein digitales Produkt zur persönlichen Organisation und Verwaltung
              von Erinnerungen.
            </p>
            <h2>3. Schweizer Transparenzrahmen</h2>
            <p>
              Diese Anbieterangaben erfolgen gemäss den in der Schweiz üblichen
              Transparenzanforderungen im E-Commerce (u. a. nach UWG-Grundsätzen).
            </p>
          </>
        ),
      },
    },
  },
};

const docOrder: LegalDocKey[] = [
  "terms",
  "agb",
  "privacy",
  "cookies",
  "disclaimer",
  "impressum",
];

export default function LegalPage() {
  const { doc } = useParams<{ doc?: string }>();
  const { lang } = useI18n();
  const landingLang =
    typeof window !== "undefined"
      ? (window.localStorage.getItem("landingLang") as "es" | "en" | "de" | null)
      : null;
  const preferred = lang === "de" || lang === "en" || lang === "es" ? lang : null;
  const locale = (landingLang ?? preferred ?? "es") as "es" | "en" | "de";

  const copy = legalCopyByLang[locale];
  const activeKey: LegalDocKey = docOrder.includes(doc as LegalDocKey)
    ? (doc as LegalDocKey)
    : "terms";
  const active = copy.docs[activeKey];

  return (
    <div
      className="remi-page text-slate-900"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, #f1eff7 0%, #fafafe 42%, #fafafe 100%)",
        paddingBottom: "32px",
      }}
    >
      <main
        className="mx-auto w-full"
        style={{
          maxWidth: "min(96vw, 960px)",
          paddingTop: "calc(16px + env(safe-area-inset-top))",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5">
              <Link
                to="/landing"
                className="inline-flex h-7 w-7 items-center justify-center text-slate-600 hover:text-slate-900"
                aria-label={copy.backToLanding}
                title={copy.backToLanding}
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <Link
                to="/landing"
                className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                {copy.backToLanding}
              </Link>
            </div>
            {docOrder.map((item) => (
              <Link
                key={item}
                to={`/legal/${item}`}
                className={
                  item === activeKey
                    ? "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold"
                    : "inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                }
                style={
                  item === activeKey
                    ? { borderColor: "#7d59c9", background: "#f1eff7", color: "#7d59c9" }
                    : undefined
                }
              >
                {copy.nav[item]}
              </Link>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-violet-100 bg-[#f8f6fc] p-4">
            <h1 className="text-xl font-extrabold text-slate-900">{active.title}</h1>
            <p className="mt-1 text-sm text-slate-600">{active.subtitle}</p>
            <p className="mt-2 text-xs text-slate-500">
              {copy.updatedAtLabel}: {copy.updatedAt}
            </p>
          </div>

          <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700 legal-doc-content">
            {active.content}
          </div>
        </div>
      </main>
    </div>
  );
}
