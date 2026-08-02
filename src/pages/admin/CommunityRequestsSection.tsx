import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { useCommunityRequests } from "../../hooks/use-community-requests";
import { useToast } from "../../hooks/use-toast";
import CommunityRequestCard from "../../components/CommunityRequestCard/CommunityRequestCard";
import SkeletonCard from "../../components/SkeletonCard/SkeletonCard";
import EmptyState from "../../components/EmptyState/EmptyState";
import { isApiError } from "../../lib/api";
import styles from "./CommunityRequestsSection.module.css";

const CommunityRequestsSection = () => {
  const { requests, loading, fetchPendingRequests, approveRequest, declineRequest } =
    useCommunityRequests();
  const { showToast } = useToast();

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  const handleApprove = async (communityId: string, assignAdmin: boolean) => {
    try {
      await approveRequest(communityId, assignAdmin);
      showToast("Community approved", "The requester has been notified.", "success");
    } catch (err) {
      showToast(
        "Approval failed",
        isApiError(err) ? err.message : "Please try again.",
        "error"
      );
    }
  };

  const handleDecline = async (communityId: string, reason: string) => {
    try {
      await declineRequest(communityId, reason);
      showToast("Request declined", "The requester has been notified.", "success");
    } catch (err) {
      showToast(
        "Decline failed",
        isApiError(err) ? err.message : "Please try again.",
        "error"
      );
    }
  };

  return (
    <div>
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.sectionTitle}>Community Requests</h2>
          <p className={styles.sectionSubtitle}>
            Review pending community creation requests.
          </p>
        </div>
        {!loading && (
          <div className={styles.totalPendingBadge}>
            <span className={styles.totalPendingIconWrap}>
              <ShieldCheck size={16} />
            </span>
            <div>
              <p className={styles.totalPendingCount}>{requests.length}</p>
              <p className={styles.totalPendingLabel}>Pending</p>
            </div>
          </div>
        )}
      </div>

      <div className={styles.requestList}>
        {loading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {!loading && requests.length === 0 && (
          <EmptyState icon={ShieldCheck} title="No pending community requests." />
        )}

        {!loading &&
          requests.map((request) => (
            <CommunityRequestCard
              key={request.community_id}
              request={request}
              onApprove={handleApprove}
              onDecline={handleDecline}
            />
          ))}
      </div>
    </div>
  );
};

export default CommunityRequestsSection;
