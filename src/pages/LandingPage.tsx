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
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge/StatusBadge";
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
}[] = [
  {
    status: "Reported",
    description: "A resident has submitted a report. Awaiting admin review.",
  },
  {
    status: "Under Review",
    description: "Your Community Admin is actively reviewing the evidence.",
  },
  {
    status: "Verified",
    description:
      "Confirmed by your Admin. SMS alert sent to all community members.",
  },
  {
    status: "Resolved",
    description:
      "The incident has been closed. Full history preserved for accountability.",
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

      {/* ---------- Hero ---------- */}
      <section className={styles.hero} id="about">
        <p className={styles.trustBar}>
          12 communities · 4,800+ residents · 3,300+ verified reports
        </p>
        <h1 className={styles.heroTitle}>
          Your Community, Guarded by{" "}
          <span className={styles.accentText}>Collective Vigilance.</span>
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

      {/* ---------- Features ---------- */}
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
                <Icon size={20} />
              </span>
              <p className={styles.featureTitle}>{title}</p>
              <p className={styles.featureDescription}>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Why Watchly ---------- */}
      <section className={styles.whySection}>
        <h2 className={styles.sectionTitleCentered}>
          Why <span className={styles.accentText}>Watchly</span>
        </h2>
        <p className={styles.sectionSubtitleCentered}>
          See how the same security event plays out when your community relies
          on group chats versus when it uses Watchly.
        </p>

        <div className={styles.comparisonGrid}>
          <div className={styles.comparisonPanel}>
            <p className={styles.comparisonLabel}>
              <span className={styles.dotAmber} />
              Without Watchly
            </p>
            <p className={styles.comparisonScenario}>
              Scenario: Armed robbery reported nearby
            </p>

            <div className={styles.chatBubbleLeft}>
              URGENT!!! Has anyone seen strange men near Gate 4?? 😨
            </div>
            <div className={styles.chatBubbleLeft}>
              My cousin said it happened 3 days ago not today
            </div>
            <div className={styles.chatBubbleLeft}>
              Is it still happening right now? Should we panic from another
              estate
            </div>
          </div>

          <div className={styles.comparisonPanel}>
            <p className={styles.comparisonLabel}>
              <span className={styles.dotGreen} />
              With Watchly
            </p>
            <p className={styles.comparisonScenario}>
              Scenario: Armed robbery reported nearby
            </p>

            <div className={styles.mockIncidentCard}>
              <div className={styles.mockIncidentHeader}>
                <div>
                  <p className={styles.mockIncidentReporter}>
                    Anonymous Resident
                  </p>
                  <p className={styles.mockIncidentMeta}>
                    Gate 4 · 4 hours ago
                  </p>
                </div>
                <StatusBadge status="Verified" size="sm" />
              </div>
              <span className={styles.mockCategoryTag}>
                Suspicious Activity
              </span>
              <p className={styles.mockIncidentTitle}>
                Suspicious vehicle parked near Close 6
              </p>
              <p className={styles.mockIncidentMeta}>5 corroborations</p>
              <div className={styles.mockStatusHistory}>
                <p className={styles.mockStatusHistoryTitle}>Status history</p>
                <p className={styles.mockStatusHistoryItem}>
                  <Check size={14} /> Reported
                </p>
                <p className={styles.mockStatusHistoryItem}>
                  <Check size={14} /> Moved to Under review
                </p>
                <p className={styles.mockStatusHistoryItem}>
                  <Check size={14} /> Verified
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- How it Works ---------- */}
      <section className={styles.howItWorksSection} id="how-it-works">
        <h2 className={styles.sectionTitleCentered}>
          How it <span className={styles.accentText}>Works</span>
        </h2>
        <p className={styles.sectionSubtitleCentered}>
          See how the same security event plays out when your community relies
          on Watchly.
        </p>

        <div className={styles.howItWorksGrid}>
          <img
            src="/assets/images/dashboard-reuse.png"
            alt="Watchly dashboard"
            className={styles.howItWorksImage}
          />

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

      {/* ---------- Status legend ---------- */}
      <section className={styles.statusSection}>
        <h2 className={styles.sectionTitleCentered}>
          Every incident has a clear,{" "}
          <span className={styles.accentText}>trackable status.</span>
        </h2>

        <div className={styles.statusGrid}>
          {STATUS_LEGEND.map(({ status, description }) => (
            <div key={status} className={styles.statusCard}>
              <p className={styles.statusCardLabel}>
                <span
                  className={
                    status === "Reported"
                      ? styles.dotStatusReported
                      : status === "Under Review"
                        ? styles.dotStatusUnderReview
                        : status === "Verified"
                          ? styles.dotStatusVerified
                          : styles.dotStatusResolved
                  }
                />
                {status}
              </p>
              <p className={styles.statusCardDescription}>{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className={styles.testimonialsSection} id="testimonials">
        <h2 className={styles.sectionTitleCentered}>
          Trusted by <span className={styles.accentText}>Communities</span>
        </h2>
        <p className={styles.sectionSubtitleCentered}>
          Real residents and admins, reporting real incidents, in real
          neighbourhoods across Lagos.
        </p>

        <div className={styles.testimonialCard}>
          <img
            src={activeTestimonial.photo}
            alt={activeTestimonial.name}
            className={styles.testimonialPhoto}
          />
          <div className={styles.testimonialContent}>
            <p className={styles.testimonialQuote}>
              &ldquo;{activeTestimonial.quote}&rdquo;
            </p>
            <p className={styles.testimonialName}>{activeTestimonial.name}</p>
            <p className={styles.testimonialRole}>{activeTestimonial.role}</p>
          </div>
          <div className={styles.testimonialArrows}>
            <button
              type="button"
              className={styles.arrowButton}
              aria-label="Previous testimonial"
              onClick={goToPrevTestimonial}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className={styles.arrowButton}
              aria-label="Next testimonial"
              onClick={goToNextTestimonial}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
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
                  size={18}
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

      {/* ---------- Final CTA ---------- */}
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
      </section>

      {/* ---------- Footer ---------- */}
      <footer className={styles.footer}>
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
          <p className={styles.footerLink}>Pricing</p>
          <p className={styles.footerLink}>Status Tips</p>
        </div>

        <div className={styles.footerColumn}>
          <p className={styles.footerColumnTitle}>Community</p>
          <p className={styles.footerLink}>Find a Community</p>
          <p className={styles.footerLink}>Request a Community</p>
          <p className={styles.footerLink}>Join as Admin</p>
        </div>

        <div className={styles.footerColumn}>
          <p className={styles.footerColumnTitle}>Legal</p>
          <p className={styles.footerLink}>Privacy</p>
          <p className={styles.footerLink}>Security</p>
          <p className={styles.footerLink}>Terms &amp; Conditions</p>
          <p className={styles.footerLink}>NDPA Compliance</p>
        </div>

        <p className={styles.footerCopyright}>
          © 2026 Watchly. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
