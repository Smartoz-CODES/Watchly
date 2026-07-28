import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Users, ShieldCheck, Copy, Check, Ban } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useCommunity } from "../hooks/use-community";
import { useCommunities } from "../hooks/use-communities";
import { useToast } from "../hooks/use-toast";
import EmptyState from "../components/EmptyState/EmptyState";
import styles from "./CommunityDetailPage.module.css";

// ---------------------------------------------------------------------
// No documented way to look up a community by slug exists anywhere in the
// TRD (§11.2 only shows lookup by community_id). Mocked here the same way
// every other unbuilt data source has been this session — the :slug param
// isn't actually used to fetch anything real yet.
//
// Also: CommunityContext's real implementation hasn't shipped
// (CommunityProvider is still the Day-2 no-op shell), so userCommunities
// is always [] regardless of what's really true — meaning the
// "authenticated member" state below is correct code that currently
// cannot ever actually be reached, through no fault of this file.
// ---------------------------------------------------------------------

const MOCK_COMMUNITY = {
  community_id: "c1",
  name: "Landmark Estate",
  state: "Lagos",
  lga: "Ikeja",
  member_count: 847,
  description:
    "Get access to verified local safety alerts, report incidents, and stay informed about what is really happening in your community.",
  status: "Active" as "Active" | "Pending" | "Declined",
};

const CommunityDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userCommunities, refreshCommunities, switchCommunity } =
    useCommunity();
  const { joinCommunity } = useCommunities();
  const { showToast } = useToast();

  const [linkCopied, setLinkCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const isLoggedIn = !!user;
  const isMember = userCommunities.some(
    (c) => c.community_id === MOCK_COMMUNITY.community_id,
  );

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
    setIsJoining(true);
    try {
      await joinCommunity(MOCK_COMMUNITY.community_id);
      // TRD §9.4's full join trace: refresh the list, then switch to the
      // community just joined, before redirecting. Missing this meant
      // someone landed on /home still looking at their old active
      // community, not the one they just joined.
      await refreshCommunities();
      switchCommunity(MOCK_COMMUNITY.community_id);
      navigate("/home");
    } catch {
      // joinCommunity is currently a stub that always throws — see
      // hooks/use-communities.ts.
      showToast(
        "Join not available yet",
        "This feature needs a backend endpoint that doesn't exist yet.",
        "error",
      );
    } finally {
      setIsJoining(false);
    }
  };

  // TRD §13.3's named edge case: someone bookmarks this page, and the
  // community is later declined or deleted. Checking here rather than
  // letting the rest of the page render identically regardless of
  // whether a real community actually still exists in this state.
  if (MOCK_COMMUNITY.status !== "Active") {
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
              src="/assets/images/commuities-image.png"
              alt=""
              className={styles.communityThumb}
            />
            <div>
              <p className={styles.communityName}>
                {MOCK_COMMUNITY.name}
                <span className={styles.verifiedPill}>
                  <ShieldCheck size={12} />
                  Verified community
                </span>
              </p>
              <div className={styles.communityMeta}>
                <span>
                  <MapPin size={14} />
                  {MOCK_COMMUNITY.lga}, {MOCK_COMMUNITY.state}
                </span>
                <span>
                  <Users size={14} />
                  {MOCK_COMMUNITY.member_count} members
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Anonymous visitor — matches the Figma directly ---------- */}
        {!isLoggedIn && (
          <>
            <h1 className={styles.title}>
              You've been invited to join {MOCK_COMMUNITY.name} community
            </h1>
            <p className={styles.description}>{MOCK_COMMUNITY.description}</p>
            <p className={styles.description}>
              The incident feed, reports, and alerts are only visible to
              members. Create an account to join and see what's happening in{" "}
              {MOCK_COMMUNITY.name}.
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

        {/* ---------- Logged in, not yet a member — no Figma reference,
            built to match the LLD spec and this page's own visual
            language ---------- */}
        {isLoggedIn && !isMember && (
          <>
            <h1 className={styles.title}>
              Join {MOCK_COMMUNITY.name} community
            </h1>
            <p className={styles.description}>{MOCK_COMMUNITY.description}</p>

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

        {/* ---------- Logged in, already a member — no Figma reference,
            same situation as above ---------- */}
        {isLoggedIn && isMember && (
          <>
            <h1 className={styles.title}>{MOCK_COMMUNITY.name}</h1>
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
          src="/assets/images/commuities-image.png"
          alt=""
          className={styles.collageImage}
        />
      </div>
    </div>
  );
};

export default CommunityDetailPage;
