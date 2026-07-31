import { useState, type ComponentType } from "react";
import CommunityRequestsSection from "./admin/CommunityRequestsSection";
import styles from "./AdminPage.module.css";

// Add a new entry here to add a new admin tool — each section owns its own
// data fetching and layout, this shell just switches between them.
const ADMIN_SECTIONS: { id: string; label: string; component: ComponentType }[] = [
  { id: "community-requests", label: "Community Requests", component: CommunityRequestsSection },
];

const AdminPage = () => {
  const [activeSectionId, setActiveSectionId] = useState(ADMIN_SECTIONS[0].id);

  const activeSection =
    ADMIN_SECTIONS.find((section) => section.id === activeSectionId) ??
    ADMIN_SECTIONS[0];
  const ActiveSectionComponent = activeSection.component;

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Admin</h1>
      <p className={styles.pageSubtitle}>Platform-wide administration tools.</p>

      <div className={styles.tabsRow}>
        {ADMIN_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            className={
              activeSectionId === section.id ? styles.tabActive : styles.tab
            }
            onClick={() => setActiveSectionId(section.id)}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className={styles.sectionContent}>
        <ActiveSectionComponent />
      </div>
    </div>
  );
};

export default AdminPage;
