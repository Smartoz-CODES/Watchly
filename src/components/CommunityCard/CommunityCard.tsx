import { useState } from "react";
import { MapPin, ShieldCheck, Users } from "lucide-react";
import type { Community } from "../../types/community";
import styles from "./CommunityCard.module.css";

interface CommunityCardProps {
  community: Community;
  onJoin: (communityId: string) => void;
}

const CommunityCard = ({ community, onJoin }: CommunityCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.cardHeader}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <img
          src="/assets/images/communities-image.png"
          alt=""
          className={styles.thumb}
        />

        <div className={styles.body}>
          <div className={styles.header}>
            <h3 className={styles.name}>
              {community.name}
              {community.status === "Active" && (
                <span className={styles.verifiedPill}>
                  <ShieldCheck size={12} />
                  Verified community
                </span>
              )}
            </h3>
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
        </div>
      </button>

      {expanded && (
        <div className={styles.expandedArea}>
          <button
            type="button"
            className={styles.joinButton}
            onClick={() => onJoin(community.community_id)}
          >
            Join Community
          </button>
        </div>
      )}
    </div>
  );
};

export default CommunityCard;
