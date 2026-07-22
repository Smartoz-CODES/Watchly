import { useCommunity } from "../hooks/use-community";

const HomeFeedPage = () => {
  const { activeCommunity } = useCommunity();

  if (!activeCommunity) {
    return (
      <div>
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
    <div>
      <h2>{activeCommunity.name}</h2>

      {mockIncidents.map((incident) => (
        <div
          key={incident.id}
          style={{
            border: "1px solid #ddd",
            padding: "16px",
            marginBottom: "16px",
            borderRadius: "8px",
          }}
        >
          <h3>{incident.category}</h3>
          <p>{incident.description}</p>
        </div>
      ))}
    </div>
  );
};

export default HomeFeedPage;
