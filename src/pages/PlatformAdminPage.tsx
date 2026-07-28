import { useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { useCommunityRequests } from "../hooks/use-community-requests";
import { useToast } from "../hooks/use-toast";
import CommunityRequestCard from "../components/CommunityRequestCard/CommunityRequestCard";
import SkeletonCard from "../components/SkeletonCard/SkeletonCard";
import EmptyState from "../components/EmptyState/EmptyState";
import styles from "./PlatformAdminPage.module.css";

const PlatformAdminPage = () => {
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
    } catch {
      showToast(
        "Approval not available yet",
        "This feature needs a backend endpoint that doesn't exist yet.",
        "error"
      );
    }
  };

  const handleDecline = async (communityId: string, reason: string) => {
    try {
      await declineRequest(communityId, reason);
      showToast("Request declined", "The requester has been notified.", "success");
    } catch {
      showToast(
        "Decline not available yet",
        "This feature needs a backend endpoint that doesn't exist yet.",
        "error"
      );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Platform Admin</h1>
          <p className={styles.pageSubtitle}>Review pending community creation requests.</p>
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

export default PlatformAdminPage;
