import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Users, ShieldCheck, Copy, Check, Ban } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useCommunity } from "../hooks/use-community";
import { useCommunities } from "../hooks/use-communities";
import { useToast } from "../hooks/use-toast";
import EmptyState from "../components/EmptyState/EmptyState";
import ErrorState from "../components/ErrorState/ErrorState";
import type { Community } from "../types/community";
import { communitiesApi, isApiError } from "../lib/api";
import styles from "./CommunityDetailPage.module.css";

const CommunityDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userCommunities, refreshCommunities, switchCommunity } =
    useCommunity();
  const { joinCommunity } = useCommunities();
  const { showToast } = useToast();

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const loadCommunity = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await communitiesApi.bySlug(slug);
      setCommunity(data);
    } catch (err) {
      setError(isApiError(err) ? err.message : "Failed to load community");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    // Fetch-on-mount/param-change: a genuine synchronization with the
    // server, not a "derive state from props" antipattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCommunity();
  }, [loadCommunity]);

  const isLoggedIn = !!user;
  const isMember =
    !!community &&
    userCommunities.some((c) => c.community_id === community.community_id);

  const inviteLink = `${window.location.origin}/c/${slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch {
      // clipboard API can fail on insecure contexts / older browsers — no
      // real fallback needed, just skip the confirmation
    }
  };

  const handleJoin = async () => {
    if (!community) return;
    setIsJoining(true);
    try {
      await joinCommunity(community.community_id);
      await refreshCommunities();
      switchCommunity(community.community_id);
      navigate("/home");
    } catch (err) {
      showToast(
        "Failed to join",
        isApiError(err) ? err.message : "Please try again.",
        "error",
      );
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return <div className={styles.page}>Loading…</div>;
  }

  if (error || !community) {
    return (
      <div className={styles.page}>
        <ErrorState
          message={error ?? "This community could not be found."}
          onRetry={loadCommunity}
        />
      </div>
    );
  }

  if (community.status !== "Active") {
    return (
      <div className={styles.page}>
        <EmptyState icon={Ban} title="This community is no longer available." />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.leftColumn}>
        <div className={styles.logo}>
          <img
            src="/assets/logo/watchly-logo-color.png"
            alt="Watchly"
            className={styles.logoMark}
          />
        </div>

        <div className={styles.card}>
          <div className={styles.communityRow}>
            <img
              src="/assets/images/communities-image.png"
              alt=""
              className={styles.communityThumb}
            />
            <div>
              <p className={styles.communityName}>
                {community.name}
                <span className={styles.verifiedPill}>
                  <ShieldCheck size={12} />
                  Verified community
                </span>
              </p>
              <div className={styles.communityMeta}>
                <span>
                  <MapPin size={14} />
                  {community.lga}, {community.state}
                </span>
                <span>
                  <Users size={14} />
                  {community.member_count} members
                </span>
              </div>
            </div>
          </div>
        </div>

        {!isLoggedIn && (
          <>
            <h1 className={styles.title}>
              You've been invited to join {community.name} community
            </h1>
            <p className={styles.description}>{community.description}</p>
            <p className={styles.description}>
              The incident feed, reports, and alerts are only visible to
              members. Create an account to join and see what's happening in{" "}
              {community.name}.
            </p>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => navigate(`/signup?community=${slug}`)}
            >
              Create account to join
            </button>
            <p className={styles.loginPrompt}>
              Have an account?{" "}
              <button
                type="button"
                className={styles.loginLink}
                onClick={() => navigate("/login")}
              >
                Login here
              </button>
            </p>
          </>
        )}

        {isLoggedIn && !isMember && (
          <>
            <h1 className={styles.title}>Join {community.name} community</h1>
            <p className={styles.description}>{community.description}</p>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleJoin}
              disabled={isJoining}
            >
              {isJoining ? "Joining…" : "Join"}
            </button>
          </>
        )}

        {isLoggedIn && isMember && (
          <>
            <h1 className={styles.title}>{community.name}</h1>
            <p className={styles.memberIndicator}>
              <Check size={16} />
              You're a member
            </p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => navigate("/home")}
            >
              Go to Feed
            </button>
          </>
        )}

        <button
          type="button"
          className={styles.copyLinkButton}
          onClick={handleCopyLink}
        >
          {linkCopied ? <Check size={16} /> : <Copy size={16} />}
          {linkCopied ? "Link copied" : "Copy Link"}
        </button>
      </div>

      <div className={styles.rightColumn}>
        <img
          src="/assets/images/communities-image.png"
          alt=""
          className={styles.collageImage}
        />
      </div>
    </div>
  );
};

export default CommunityDetailPage;
