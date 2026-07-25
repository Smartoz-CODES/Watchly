import { useCommunity } from "../hooks/use-community";
import styles from "./HomeFeedPage.module.css";

const HomeFeedPage = () => {
  const { activeCommunity } = useCommunity();

  if (!activeCommunity) {
    return (
      <div className={styles.emptyState}>
        <h2>Home Feed</h2>
        <p>Join a community to see the feed.</p>
      </div>
    );
  }

  const mockIncidents = [
    {
      id: "1",
      category: "Theft",
      description: "Phone stolen near the main gate.",
    },
    {
      id: "2",
      category: "Fire",
      description: "Small fire reported beside Block C.",
    },
    {
      id: "3",
      category: "Suspicious Person",
      description: "Unknown individual seen around the hostel entrance.",
    },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.communityName}>{activeCommunity.name}</h2>

      {mockIncidents.map((incident) => (
        <div key={incident.id} className={styles.incidentCard}>
          <p className={styles.incidentCategory}>{incident.category}</p>
          <p className={styles.incidentDescription}>{incident.description}</p>
        </div>
      ))}
    </div>
  );
};

export default HomeFeedPage;