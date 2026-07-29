import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Shield,
  Users,
  Lock,
  UserPlus,
  Bell,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import styles from "./LandingPage.module.css";

const NAV_LINKS = [
  { label: "About", id: "about" },
  { label: "Features", id: "features" },
  { label: "How it works", id: "how-it-works" },
  { label: "Testimonials", id: "testimonials" },
  { label: "FAQs", id: "faqs" },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Structured Reporting",
    description:
      "Any resident can file a structured incident report with photos, location and categories which is then verified by community administrators.",
  },
  {
    icon: Users,
    title: "Community Collaboration",
    description:
      "Residents confirm incidents they genuinely witnessed. Self-corroboration and duplicates are blocked by design.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    description:
      "Reporter identities are never publicly exposed. Share what you know without risking your personal safety.",
  },
  {
    icon: UserPlus,
    title: "Membership",
    description:
      "Belong to multiple communities, your estate, workplace area, family neighborhood from one account.",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description:
      "Instant push notifications reach every resident within seconds of a verified incident. No delays, no missed warnings.",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: "Report",
    description:
      "A resident submits a structured incident report with location, category, description, and optional photo evidence.",
  },
  {
    step: 2,
    title: "Corroborate",
    description:
      "Neighbors who witnessed the incident confirm it. Corroboration is a trust signal and never an automatic verdict.",
  },
  {
    step: 3,
    title: "Admin Reviews",
    description:
      "Your Community Admin reviews the full report, evidence, and community corroborations before making a decision.",
  },
  {
    step: 4,
    title: "Verified",
    description:
      "Once verified, the status updates and community members receive an SMS alert even outside the app.",
  },
  {
    step: 5,
    title: "Resolved",
    description:
      "The admin closes the incident. The full history remains visible for accountability.",
  },
];

const STATUS_LEGEND: {
  status: "Reported" | "Under Review" | "Verified" | "Resolved";
  description: string;
  cardClass: keyof typeof styles;
  dotClass: keyof typeof styles;
}[] = [
  {
    status: "Reported",
    description: "A resident has submitted a report. Awaiting admin review.",
    cardClass: "statusCardReported",
    dotClass: "dotStatusReported",
  },
  {
    status: "Under Review",
    description: "Your Community Admin is actively reviewing the evidence.",
    cardClass: "statusCardUnderReview",
    dotClass: "dotStatusUnderReview",
  },
  {
    status: "Verified",
    description:
      "Confirmed by your Admin. SMS alert sent to all community members.",
    cardClass: "statusCardVerified",
    dotClass: "dotStatusVerified",
  },
  {
    status: "Resolved",
    description:
      "The incident has been closed. Full history preserved for accountability.",
    cardClass: "statusCardResolved",
    dotClass: "dotStatusResolved",
  },
];

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  photo: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I joined in minutes and finally feel connected to what is happening around me.",
    name: "Ogechukwu Kelvin",
    role: "Resident, Landmark Estate, Ikeja.",
    photo: "/assets/images/Ogechukwu-Kelvin.png",
  },
  {
    quote:
      "As a local government official, Watchly gives me verified incident data I can actually act on not hearsay.",
    name: "Gerald Okonkwo",
    role: "Community Development Officer, Ikeja GRA",
    photo: "/assets/images/Gerald-Okonkwo.png",
  },
  {
    quote:
      "The status updates mean a lot. I know what needs attention and what has been resolved.",
    name: "Oluwatunmise Faith",
    role: "Resident, Liberty Estate, Enugu.",
    photo: "/assets/images/Oluwatunmise-Faith.png",
  },
];

const FAQS = [
  {
    question: "Is my identity kept private when I report?",
    answer:
      "Yes, reporter identities are never shown publicly on Watchly by default. Your information is only accessible to Community Admins and Platform Admins in cases of serious misuse investigation, and even then under strict conditions.",
  },
  {
    question: "Who verifies the incidents?",
    answer:
      "Your community's Community Admin reviews every report, along with any corroborations and evidence, before deciding whether to mark it Verified or Not Verified.",
  },
  {
    question: "What does corroboration mean?",
    answer:
      "Corroboration is a one-tap way for other residents to confirm they also know about or witnessed an incident. It's a supporting trust signal for the admin, not an automatic verdict.",
  },
  {
    question: "Can I join more than one community?",
    answer:
      "Yes. One account can belong to multiple communities at once — your estate, workplace area, or family neighborhood — and you can switch between them at any time.",
  },
  {
    question: "How do I create a community for my estate?",
    answer:
      "If your community isn't listed yet, you can request to create it after signing up. Requests are reviewed within 2-3 business days.",
  },
];

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleNavClick = (id: string) => {
    setDrawerOpen(false);
    scrollToSection(id);
  };

  const goToPrevTestimonial = () => {
    setTestimonialIndex((prev) =>
      prev === 0 ? TESTIMONIALS.length - 1 : prev - 1,
    );
  };

  const goToNextTestimonial = () => {
    setTestimonialIndex((prev) =>
      prev === TESTIMONIALS.length - 1 ? 0 : prev + 1,
    );
  };

  const activeTestimonial = TESTIMONIALS[testimonialIndex];

  return (
    <div className={styles.page}>
      {/* ---------- Nav ---------- */}
      <header className={styles.nav}>
        <div className={styles.logo}>
          <img
            src="/assets/logo/watchly-logo-color.png"
            alt="Watchly"
            className={styles.logoMark}
          />
        </div>

        <nav className={styles.navLinksDesktop}>
          {NAV_LINKS.map(({ label, id }) => (
            <button
              key={id}
              type="button"
              className={styles.navLink}
              onClick={() => handleNavClick(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className={styles.navActionsDesktop}>
          <button
            type="button"
            className={styles.loginLink}
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            type="button"
            className={styles.getStartedButton}
            onClick={() => navigate("/signup")}
          >
            Get started
          </button>
        </div>

        <button
          type="button"
          className={styles.hamburgerButton}
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={24} />
        </button>
      </header>

      {isDrawerOpen && (
        <div
          className={styles.drawerOverlay}
          onClick={() => setDrawerOpen(false)}
        >
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <img
                src="/assets/logo/watchly-logo-color.png"
                alt="Watchly"
                className={styles.logoMark}
              />

              <button
                type="button"
                className={styles.iconButton}
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
              >
                <X size={22} />
              </button>
            </div>

            <nav className={styles.drawerLinks}>
              {NAV_LINKS.map(({ label, id }) => (
                <button
                  key={id}
                  type="button"
                  className={styles.drawerLink}
                  onClick={() => handleNavClick(id)}
                >
                  {label}
                </button>
              ))}
            </nav>

            <button
              type="button"
              className={styles.getStartedButtonFull}
              onClick={() => navigate("/signup")}
            >
              Get started
            </button>

            <button
              type="button"
              className={styles.loginLinkCentered}
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className={styles.hero} id="about">
        <div className={styles.trustBarWrapper}>
          <img
            src="/assets/images/community-testimonial.png"
            alt=""
            className={styles.avatarCluster}
          />

          <p className={styles.trustBar}>
            12 communities · 4,800+ residents · 3,300+ verified reports
          </p>
        </div>

        <h1 className={styles.heroTitle}>
          Your Community, Guarded by{" "}
          <span className={styles.accentTextHero}>Collective Vigilance.</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Real-time incident tracking, verified resident corroboration, and
          instant emergency broadcasts. Empowering neighborhoods with the data
          they need to stay safe.
        </p>

        <div className={styles.heroButtons}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate("/signup")}
          >
            Join your community
          </button>

          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => scrollToSection("how-it-works")}
          >
            See how it works
          </button>
        </div>

        <img
          src="/assets/images/dashboard.png"
          alt="Watchly dashboard"
          className={styles.heroImage}
        />
      </section>

      {/* Features */}
      <section className={styles.featuresSection} id="features">
        <div className={styles.featuresHeader}>
          <h2 className={styles.sectionTitle}>
            Designed for{" "}
            <span className={styles.accentText}>Maximum Awareness</span>
          </h2>

          <p className={styles.featuresIntro}>
            Watchly is built for residents who want to stay informed, protected,
            and in control of their community's safety.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className={styles.featureCard}>
              <span className={styles.featureIconWrap}>
                <Icon className={styles.featureIcon} />
              </span>

              <p className={styles.featureTitle}>{title}</p>

              <p className={styles.featureDescription}>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Watchly */}
      <section className={styles.whySection}>
        <h2 className={styles.sectionTitleCentered}>
          Why <span className={styles.accentText}>Watchly</span>
        </h2>

        <p className={styles.sectionSubtitleCentered}>
          See how the same security event plays out when your community relies
          on group chats versus when it uses Watchly.
        </p>

        <img
          src="/assets/images/why-watchly-comparison.png"
          alt="Comparison of an incident report without Watchly versus with Watchly"
          className={styles.whyComparisonImage}
        />
      </section>

      {/* How it Works */}
      <section className={styles.howItWorksSection} id="how-it-works">
        <h2 className={styles.sectionTitleCentered}>
          How it <span className={styles.accentTextWorks}>Works</span>
        </h2>

        <p className={styles.sectionSubtitleCentered}>
          See how the same security event plays out when your community relies
          on Watchly.
        </p>

        <div className={styles.howItWorksGrid}>
          <div className={styles.howItWorksImageFrame}>
            <img
              src="/assets/images/how-it-works.png"
              alt="Watchly dashboard"
              className={styles.howItWorksImage}
            />
          </div>

          <div className={styles.stepsList}>
            {HOW_IT_WORKS_STEPS.map(({ step, title, description }) => (
              <div key={step} className={styles.stepRow}>
                <span className={styles.stepBadge}>Step {step}</span>

                <p className={styles.stepTitle}>{title}</p>

                <p className={styles.stepDescription}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Status */}
      <section className={styles.statusSection}>
        <h2 className={styles.sectionTitleCentered}>
          Every incident has a clear,{" "}
          <span className={styles.accentText}>trackable status.</span>
        </h2>

        <div className={styles.statusGrid}>
          {STATUS_LEGEND.map(({ status, description, cardClass, dotClass }) => (
            <div
              key={status}
              className={`${styles.statusCard} ${styles[cardClass]}`}
            >
              <span className={styles[dotClass]} />

              <p className={styles.statusCardLabel}>{status}</p>

              <p className={styles.statusCardDescription}>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonialsSection} id="testimonials">
        <h2 className={styles.sectionTitleCentered}>
          Trusted by <span className={styles.accentText}>Communities</span>
        </h2>

        <p className={styles.sectionSubtitleCentered}>
          Real residents and admins, reporting real incidents, in real
          neighbourhoods across Lagos.
        </p>

        <div className={styles.testimonialCard}>
          <div className={styles.testimonialPhotoArea}>
            <div className={styles.testimonialPhotoPanel}>
              <img
                src={activeTestimonial.photo}
                alt={activeTestimonial.name}
                className={styles.testimonialPhoto}
              />
            </div>
          </div>

          <div className={styles.testimonialContent}>
            <p className={styles.testimonialQuote}>
              &ldquo;{activeTestimonial.quote}&rdquo;
            </p>

            <div className={styles.testimonialNameBlock}>
              <p className={styles.testimonialName}>{activeTestimonial.name}</p>

              <p className={styles.testimonialRole}>{activeTestimonial.role}</p>
            </div>
          </div>

          <div className={styles.testimonialArrows}>
            <button
              type="button"
              className={styles.arrowButton}
              aria-label="Previous testimonial"
              onClick={goToPrevTestimonial}
            >
              <ArrowLeft size={24} strokeWidth={1.8} />
            </button>

            <button
              type="button"
              className={styles.arrowButton}
              aria-label="Next testimonial"
              onClick={goToNextTestimonial}
            >
              <ArrowRight size={24} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection} id="faqs">
        <h2 className={styles.sectionTitleCentered}>
          Frequently <span className={styles.accentText}>Asked Questions</span>
        </h2>

        <p className={styles.sectionSubtitleCentered}>
          Everything you need to know about Watchly. Can't find an answer? Reach
          out to us.
        </p>

        <div className={styles.faqList}>
          {FAQS.map((faq, i) => (
            <div key={faq.question} className={styles.faqItem}>
              <button
                type="button"
                className={styles.faqQuestion}
                onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
              >
                {faq.question}

                <ChevronDown
                  className={
                    openFaqIndex === i
                      ? styles.faqChevronOpen
                      : styles.faqChevron
                  }
                />
              </button>

              {openFaqIndex === i && (
                <p className={styles.faqAnswer}>{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <h2 className={styles.finalCtaTitle}>
          Ready to bring trusted safety intelligence{" "}
          <span className={styles.accentTextLight}>to your community?</span>
        </h2>

        <div className={styles.heroButtons}>
          <button
            type="button"
            className={styles.finalCtaPrimary}
            onClick={() => navigate("/signup")}
          >
            Join your community
          </button>

          <button
            type="button"
            className={styles.finalCtaSecondary}
            onClick={() => scrollToSection("how-it-works")}
          >
            See how it works
          </button>
        </div>

        <p className={styles.finalCtaDisclaimer}>
          Free to join. No credit card required. Available across Nigeria.
        </p>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLinksRow}>
          <div className={styles.footerBrand}>
            <img
              src="/assets/logo/watchly-logo-white.png"
              alt="Watchly"
              className={styles.footerLogo}
            />

            <p className={styles.footerTagline}>
              Trusted community safety intelligence.
            </p>
          </div>

          <div className={styles.footerColumn}>
            <p className={styles.footerColumnTitle}>Company</p>
            <p className={styles.footerLink}>About</p>
            <p className={styles.footerLink}>Our Mission</p>
            <p className={styles.footerLink}>Research</p>
            <p className={styles.footerLink}>Contact</p>
          </div>

          <div className={styles.footerColumn}>
            <p className={styles.footerColumnTitle}>Product</p>
            <p className={styles.footerLink}>How it Works</p>
            <p className={styles.footerLink}>Features</p>
            <p className={styles.footerLink}>For Admins</p>
            <p className={styles.footerLink}>Status Lifecycle</p>
          </div>

          <div className={styles.footerColumn}>
            <p className={styles.footerColumnTitle}>Community</p>
            <p className={styles.footerLink}>Find a Community</p>
            <p className={styles.footerLink}>Request a Community</p>
            <p className={styles.footerLink}>Join as Admin</p>
            <p className={styles.footerLink}>Safety Tips</p>
          </div>

          <div className={styles.footerColumn}>
            <p className={styles.footerColumnTitle}>Legal</p>
            <p className={styles.footerLink}>Privacy</p>
            <p className={styles.footerLink}>Security</p>
            <p className={styles.footerLink}>Terms &amp; Conditions</p>
            <p className={styles.footerLink}>NDPA Compliance</p>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.footerCopyright}>
            © 2026 Watchly. All rights reserved.
          </p>

          <div className={styles.footerSocials}>
            <a href="#" aria-label="Facebook" className={styles.socialIcon}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H16.7V3.7c-.28-.04-1.25-.12-2.37-.12-2.35 0-3.96 1.43-3.96 4.06v2.26H7.6V13h2.77v8h3.13z" />
              </svg>
            </a>

            <a href="#" aria-label="Instagram" className={styles.socialIcon}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.2"
                  cy="6.8"
                  r="1.1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>

            <a href="#" aria-label="X (Twitter)" className={styles.socialIcon}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.9 3H22l-7.6 8.7L23 21h-6.6l-5.2-6.4L5.2 21H2l8.1-9.3L1.6 3h6.8l4.7 5.9L18.9 3zm-1.2 16h1.7L7.1 4.9H5.3L17.7 19z" />
              </svg>
            </a>

            <a href="#" aria-label="LinkedIn" className={styles.socialIcon}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6.94 8.5H3.56V21h3.38V8.5zM5.25 3a2 2 0 100 4 2 2 0 000-4zM21 21v-7.15c0-3.4-1.82-4.98-4.24-4.98-1.96 0-2.83 1.08-3.32 1.83V9.06H10.06c.05 1.02 0 12 0 12h3.38v-6.7c0-.36.03-.72.13-.98.29-.72.96-1.47 2.07-1.47 1.46 0 2.05 1.11 2.05 2.75V21H21z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
