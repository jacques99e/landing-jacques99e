import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/vitrine/SiteHeader";
import { SiteFooter } from "@/components/vitrine/SiteFooter";
import { LEGAL_ENTITY, LEGAL_PAGES } from "@/lib/legal-content";

interface LegalPageShellProps {
  title: string;
  children: ReactNode;
}

export function LegalPageShell({ title, children }: LegalPageShellProps) {
  return (
    <div className="scroll-smooth bg-[#FFF8F0] font-[system-ui,sans-serif] text-[#1A1A1A]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-6">
        <nav className="mb-6 text-sm text-[#1A1A1A]/60">
          <Link href="/" className="hover:text-[#075E54]">
            Accueil
          </Link>
          <span className="mx-2">/</span>
          <Link href="/legal" className="hover:text-[#075E54]">
            Légal
          </Link>
          <span className="mx-2">/</span>
          <span>{title}</span>
        </nav>
        <h1 className="text-3xl font-bold text-[#075E54]">{title}</h1>
        <p className="mt-2 text-sm text-[#1A1A1A]/60">
          Dernière mise à jour : {LEGAL_ENTITY.lastUpdated}
        </p>
        <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-[#1A1A1A]/85">
          {children}
        </div>
        <aside className="mt-12 rounded-2xl border border-[#075E54]/15 bg-white p-5">
          <p className="text-sm font-semibold text-[#075E54]">Autres documents</p>
          <ul className="mt-3 space-y-2 text-sm">
            {LEGAL_PAGES.map((page) => (
              <li key={page.href}>
                <Link href={page.href} className="text-[#075E54] underline hover:opacity-80">
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold text-[#1A1A1A]">{title}</h2>
      {children}
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function MentionsLegalesContent() {
  const e = LEGAL_ENTITY;
  return (
    <>
      <Section title="1. Éditeur du site">
        <P>
          Le site <strong>wazo-digital.com</strong> et l&apos;application <strong>app.wazo-digital.com</strong>{" "}
          sont édités par <strong>{e.editor}</strong>, activité de gestion digitale pour
          micro-entreprises et PME en Afrique.
        </P>
        <Ul
          items={[
            `Pays d'exploitation : ${e.country}`,
            `Contact : ${e.contactEmail}`,
            `Support WhatsApp : ${e.supportWhatsApp}`,
          ]}
        />
      </Section>
      <Section title="2. Directeur de la publication">
        <P>Le responsable de la publication est le représentant légal de {e.brand}.</P>
      </Section>
      <Section title="3. Hébergement">
        <Ul items={[e.hosting.site, `Base de données et authentification : ${e.hosting.database}`]} />
      </Section>
      <Section title="4. Propriété intellectuelle">
        <P>
          L&apos;ensemble des éléments du site et de l&apos;application (textes, logos, interface, code)
          est protégé. Toute reproduction non autorisée est interdite.
        </P>
      </Section>
      <Section title="5. Signalement">
        <P>
          Pour signaler un contenu illicite ou une faille de sécurité : {e.contactEmail} ou WhatsApp{" "}
          {e.supportWhatsApp}.
        </P>
      </Section>
    </>
  );
}

export function ConfidentialiteContent() {
  const e = LEGAL_ENTITY;
  return (
    <>
      <Section title="1. Responsable du traitement">
        <P>
          <strong>{e.dataController}</strong> est responsable du traitement des données personnelles
          collectées via le site vitrine et l&apos;application Wazo Digital.
        </P>
      </Section>
      <Section title="2. Données collectées">
        <Ul
          items={[
            "Identité : nom, adresse e-mail, téléphone (connexion, équipe, SMS optionnels).",
            "Données d'activité : ventes, stocks, clients, patients, livraisons, cours — saisies par l'utilisateur.",
            "Données techniques : logs, adresse IP, type d'appareil, cookies de session.",
            "Paiements : identifiants de transaction Mobile Money via notre prestataire PayDunya (nous ne stockons pas votre code PIN MoMo).",
          ]}
        />
      </Section>
      <Section title="3. Finalités">
        <Ul
          items={[
            "Création et gestion de compte utilisateur.",
            "Fourniture des services (caisse, modules métier, rapports, formation).",
            "Facturation des abonnements PRO et BUSINESS.",
            "Support client et sécurité de la plateforme.",
            "Amélioration du produit (statistiques agrégées, anonymisées lorsque possible).",
          ]}
        />
      </Section>
      <Section title="4. Base légale">
        <P>
          Exécution du contrat (CGU), intérêt légitime (sécurité, amélioration), et consentement lorsque
          requis (cookies non essentiels, communications marketing).
        </P>
      </Section>
      <Section title="5. Durée de conservation">
        <Ul
          items={[
            "Compte actif : données conservées tant que le compte existe.",
            "Après suppression : sauvegarde technique limitée (jusqu'à 12 mois) puis effacement ou anonymisation.",
            "Facturation : conservation légale des preuves de paiement selon obligations comptables.",
          ]}
        />
      </Section>
      <Section title="6. Sous-traitants">
        <Ul
          items={[
            "Supabase — hébergement base de données et authentification (UE / Singapour).",
            "Vercel — hébergement application web.",
            "PayDunya — paiements Mobile Money.",
            "Resend — envoi d'e-mails transactionnels (rapports, notifications).",
            "Twilio (le cas échéant) — SMS de rappel ou notification.",
          ]}
        />
      </Section>
      <Section title="7. Transferts hors UE">
        <P>
          Certains prestataires peuvent traiter des données hors de l&apos;Union européenne. Des garanties
          contractuelles (clauses types) ou mécanismes équivalents sont mis en place lorsque applicable.
        </P>
      </Section>
      <Section title="8. Vos droits">
        <P>
          Vous disposez des droits d&apos;accès, de rectification, d&apos;effacement, de limitation, de
          portabilité et d&apos;opposition. Pour les exercer : {e.contactEmail}. Vous pouvez introduire
          une réclamation auprès de l&apos;autorité de protection des données compétente dans votre pays.
        </P>
      </Section>
      <Section title="9. Sécurité">
        <P>
          Chiffrement HTTPS, isolation des données par boutique (RLS Supabase), authentification sécurisée.
          Vous êtes responsable de la confidentialité de votre mot de passe.
        </P>
      </Section>
      <Section title="10. Mineurs">
        <P>Le service s&apos;adresse aux professionnels. Il n&apos;est pas destiné aux moins de 16 ans.</P>
      </Section>
    </>
  );
}

export function CguContent() {
  const e = LEGAL_ENTITY;
  return (
    <>
      <Section title="1. Objet">
        <P>
          Les présentes CGU régissent l&apos;accès au site wazo-digital.com et à l&apos;application
          app.wazo-digital.com, édités par {e.brand}.
        </P>
      </Section>
      <Section title="2. Acceptation">
        <P>
          La création d&apos;un compte ou l&apos;utilisation du service vaut acceptation des CGU et de la
          politique de confidentialité.
        </P>
      </Section>
      <Section title="3. Description du service">
        <P>
          Wazo Digital est une plateforme SaaS multi-modules (commerce, agriculture, santé, logistique,
          formation, traçabilité) destinée à la gestion d&apos;activités professionnelles.
        </P>
      </Section>
      <Section title="4. Compte utilisateur">
        <Ul
          items={[
            "Informations exactes à l'inscription.",
            "Un compte par personne morale ou entrepreneur, sauf invitation équipe (plan BUSINESS).",
            "Vous êtes responsable de l'activité réalisée sous votre compte.",
          ]}
        />
      </Section>
      <Section title="5. Abonnements et paiement">
        <Ul
          items={[
            "Offre GRATUITE avec limites (produits, boutiques) décrites sur la page Tarifs.",
            "Offres PRO et BUSINESS facturées mensuellement via Mobile Money (PayDunya).",
            "Résiliation possible à tout moment ; l'accès payant reste actif jusqu'à la fin de la période en cours.",
            "Aucun remboursement au prorata sauf disposition légale impérative.",
          ]}
        />
      </Section>
      <Section title="6. Obligations de l'utilisateur">
        <Ul
          items={[
            "Utiliser le service conformément aux lois locales (commerce, santé, données personnelles).",
            "Ne pas publier de contenu illicite, diffamatoire ou portant atteinte aux droits de tiers.",
            "Obtenir les consentements requis pour les données de vos clients/patients que vous saisissez.",
          ]}
        />
      </Section>
      <Section title="7. Données saisies par l'utilisateur">
        <P>
          Vous restez propriétaire de vos données métier. {e.brand} dispose d&apos;une licence limitée pour
          les héberger, sauvegarder et afficher dans le cadre du service.
        </P>
      </Section>
      <Section title="8. Disponibilité">
        <P>
          Nous visons une haute disponibilité mais ne garantissons pas l&apos;absence d&apos;interruption
          (maintenance, réseau, force majeure). Un mode hors ligne local peut compenser temporairement
          l&apos;absence de connexion.
        </P>
      </Section>
      <Section title="9. Limitation de responsabilité">
        <P>
          {e.brand} n&apos;est pas responsable des pertes indirectes, ni des erreurs de saisie par
          l&apos;utilisateur. La responsabilité totale est limitée au montant payé sur les 12 derniers mois.
        </P>
      </Section>
      <Section title="10. Résiliation">
        <P>
          Nous pouvons suspendre un compte en cas de violation grave des CGU. Vous pouvez supprimer votre
          compte en contactant {e.contactEmail}.
        </P>
      </Section>
      <Section title="11. Droit applicable">
        <P>
          Les CGU sont régies par le droit du pays d&apos;exploitation ({e.country}), sous réserve des
          dispositions impératives de protection des consommateurs applicables dans votre juridiction.
        </P>
      </Section>
    </>
  );
}

export function CookiesContent() {
  const e = LEGAL_ENTITY;
  return (
    <>
      <Section title="1. Qu'est-ce qu'un cookie ?">
        <P>
          Un cookie est un petit fichier déposé sur votre appareil lors de la visite d&apos;un site ou de
          l&apos;utilisation d&apos;une application web.
        </P>
      </Section>
      <Section title="2. Cookies utilisés">
        <Ul
          items={[
            "Cookies strictement nécessaires : session d'authentification Supabase, préférences de langue, consentement cookies.",
            "Cookies de mesure (si activés) : statistiques d'audience anonymisées pour améliorer le produit.",
          ]}
        />
      </Section>
      <Section title="3. Gestion du consentement">
        <P>
          Lors de votre première visite, une bannière vous permet d&apos;accepter ou de refuser les cookies
          non essentiels. Vous pouvez modifier votre choix en effaçant les données du site dans votre
          navigateur.
        </P>
      </Section>
      <Section title="4. Durée">
        <P>Les cookies de session expirent à la fermeture du navigateur. Le consentement est mémorisé 12 mois.</P>
      </Section>
      <Section title="5. Contact">
        <P>Questions : {e.contactEmail}</P>
      </Section>
    </>
  );
}
