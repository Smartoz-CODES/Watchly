import { MapPin, Users } from "lucide-react";
import type { Community } from "../../types/community";
import styles from "./CommunityCard.module.css";

interface CommunityCardProps {
  community: Community;
  onTap: (slug: string) => void;
}

const CommunityCard = ({ community, onTap }: CommunityCardProps) => {
  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => onTap(community.slug)}
    >
      <div className={styles.header}>
        <h3 className={styles.name}>{community.name}</h3>
        <span className={styles.memberCount}>
          <Users size={14} />
          {community.member_count}
        </span>
      </div>

      <p className={styles.location}>
        <MapPin size={14} />
        {community.lga}, {community.state}
      </p>

      {community.description && (
        <p className={styles.description}>{community.description}</p>
      )}
    </button>
  );
};

export default CommunityCard;