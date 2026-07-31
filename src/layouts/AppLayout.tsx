import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Search,
  Bell,
  Plus,
  ChevronDown,
  ChevronUp,
  Home,
  FileText,
  Info,
  Settings,
  LogOut,
  MapPin,
  Pencil,
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useCommunity } from "../hooks/use-community";
import type { Community } from "../types/community";
import styles from "./AppLayout.module.css";

const MENU_ITEMS = [
  { to: "/home", label: "Incident Feed", icon: Home },
  { to: "/my-report", label: "My Report", icon: FileText },
  { to: "/alerts", label: "Alert", icon: Bell },
  { to: "/community-info", label: "Community Info", icon: Info },
];

const ADMIN_MENU_ITEM = { to: "/admin/queue", label: "Review", icon: Pencil };

const AppLayout = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { activeCommunity, userCommunities, switchCommunity, isAdmin } =
    useCommunity();
  const location = useLocation();

  // NavLink's own active-matching only catches exact prefixes of its own
  // `to` path — it has no way to know /admin/review/:id belongs to the
  // same section as /admin/queue, since they're separate paths under
  // /admin. Checking manually so "Review" stays highlighted on both.
  const isReviewSectionActive = location.pathname.startsWith("/admin");

  // "Review" only shows for real Community Admins — matches the Figma's
  // admin-only sidebar, and matches AdminQueuePage's own access check, so
  // there's now an actual door into a page that already had working
  // access control but no way to reach it.
  const menuItems = isAdmin ? [...MENU_ITEMS, ADMIN_MENU_ITEM] : MENU_ITEMS;

  // use-alerts.ts is still empty — nothing to import yet. Hardcode the
  // badge to 0 for now, per the LLD's own fallback for this exact gap
  // (§3.1: "Dev A hardcodes the badge count to zero or hides it entirely").
  // Swap this for useAlerts().unreadCount once that hook ships.
  const unreadCount = 0;
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      // signOut() already fires its own error toast — nothing more to do
      // here besides not leaving an unhandled rejection.
    } finally {
      setIsSigningOut(false);
    }
  };

  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isSwitcherOpen, setSwitcherOpen] = useState(false);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSwitcherOpen(false);
  };

  const handleSwitch = (communityId: string) => {
    switchCommunity(communityId);
    setSwitcherOpen(false);
    closeDrawer();
  };

  const otherCommunities = userCommunities.filter(
    (c: Community) => c.community_id !== activeCommunity?.community_id,
  );

  return (
    <div className={styles.wrapper}>
      {/* ---------- Top bar ---------- */}
      <header className={styles.topBar}>
        <button
          type="button"
          className={styles.hamburgerButton}
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={22} />
        </button>

        <div className={styles.logo}>
          <img
            src="/assets/logo/watchly-logo-color.png"
            alt="Watchly"
            className={styles.logoMark}
          />
        </div>

        <div className={styles.searchDesktop}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search reports, incidents..."
            className={styles.searchInput}
          />
        </div>

        <button
          type="button"
          className={styles.searchMobileButton}
          aria-label="Search"
        >
          <Search size={20} />
        </button>

        <button
          type="button"
          className={styles.reportButtonDesktop}
          onClick={() => navigate("/report")}
        >
          <Plus size={18} />
          Report
        </button>

        <button
          type="button"
          className={styles.iconButton}
          aria-label="Alerts"
          onClick={() => navigate("/alerts")}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className={styles.badge}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <div className={styles.profile}>
          {user?.profile_image_url ? (
            <img
              src={user.profile_image_url}
              alt=""
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarFallback}>
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <span className={styles.profileName}>{user?.name}</span>
        </div>
      </header>

      <div className={styles.body}>
        {/* ---------- Desktop sidebar ---------- */}
        <aside className={styles.sidebarDesktop}>
          <CommunitySwitcher
            activeCommunity={activeCommunity}
            otherCommunities={otherCommunities}
            isOpen={isSwitcherOpen}
            onToggle={() => setSwitcherOpen((v) => !v)}
            onSwitch={handleSwitch}
          />

          <p className={styles.menuLabel}>MENU</p>
          <nav className={styles.menuList}>
            {menuItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => {
                  const active =
                    to === "/admin/queue" ? isReviewSectionActive : isActive;
                  return active
                    ? `${styles.menuItem} ${styles.menuItemActive}`
                    : styles.menuItem;
                }}
              >
                <Icon size={24} />
                {label}
              </NavLink>
            ))}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive
                  ? `${styles.menuItem} ${styles.menuItemActive}`
                  : styles.menuItem
              }
            >
              <Settings size={24} />
              Settings
            </NavLink>
          </nav>

          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut size={16} />
            {isSigningOut ? "Logging out…" : "Logout"}
          </button>

          <StaySafeCard />
        </aside>

        {/* ---------- Mobile drawer ---------- */}
        {isDrawerOpen && (
          <div className={styles.drawerOverlay} onClick={closeDrawer}>
            <aside
              className={styles.drawer}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.drawerHeader}>
                <div className={styles.logo}>
                  <img
                    src="/assets/logo/watchly-logo-color.png"
                    alt="Watchly"
                    className={styles.logoMark}
                  />
                </div>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="Close menu"
                  onClick={closeDrawer}
                >
                  <X size={20} />
                </button>
              </div>

              <CommunitySwitcher
                activeCommunity={activeCommunity}
                otherCommunities={otherCommunities}
                isOpen={isSwitcherOpen}
                onToggle={() => setSwitcherOpen((v) => !v)}
                onSwitch={handleSwitch}
              />

              {!isSwitcherOpen && (
                <>
                  <p className={styles.menuLabel}>MENU</p>
                  <nav className={styles.menuList}>
                    {menuItems.map(({ to, label, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={closeDrawer}
                        className={({ isActive }) => {
                          const active =
                            to === "/admin/queue"
                              ? isReviewSectionActive
                              : isActive;
                          return active
                            ? `${styles.menuItem} ${styles.menuItemActive}`
                            : styles.menuItem;
                        }}
                      >
                        <Icon size={18} />
                        {label}
                      </NavLink>
                    ))}
                  </nav>
                </>
              )}

              {isSwitcherOpen && (
                <nav className={styles.menuList}>
                  {MENU_ITEMS.filter(
                    (item) => item.to === "/community-info",
                  ).map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={closeDrawer}
                      className={styles.menuItem}
                    >
                      <Icon size={18} />
                      {label}
                    </NavLink>
                  ))}
                </nav>
              )}

              <div className={styles.drawerFooter}>
                <NavLink
                  to="/settings"
                  onClick={closeDrawer}
                  className={styles.menuItem}
                >
                  <Settings size={18} />
                  Settings
                </NavLink>
                <button
                  type="button"
                  className={styles.logoutButton}
                  disabled={isSigningOut}
                  onClick={() => {
                    closeDrawer();
                    handleSignOut();
                  }}
                >
                  <LogOut size={16} />
                  {isSigningOut ? "Logging out…" : "Logout"}
                </button>
                <StaySafeCard />
              </div>
            </aside>
          </div>
        )}

        {/* ---------- Main content ---------- */}
        <main className={styles.content}>
          <Outlet />

          {/* Disclaimer stacks below feed content on mobile; desktop
              renders it in the right panel instead (see below). */}
          <div className={styles.disclaimerMobile}>
            <EmergencyDisclaimer />
          </div>
        </main>

        {/* ---------- Desktop right panel ---------- */}
        <aside className={styles.rightPanel}>
          {activeCommunity && (
            <div className={styles.statsCard}>
              <p className={styles.statsCardTitle}>{activeCommunity.name}</p>
              <p className={styles.statsCardSubtitle}>
                {activeCommunity.lga}, {activeCommunity.state}
              </p>
              <div className={styles.statsRow}>
                <span>Members</span>
                <span>{activeCommunity.member_count}</span>
              </div>
              <div className={styles.statsRow}>
                <span>Admin</span>
                <span>{activeCommunity.admin_name ?? "—"}</span>
              </div>
              <div className={styles.statsRow}>
                <span>Active since</span>
                <span>{formatActiveSince(activeCommunity.active_since)}</span>
              </div>
            </div>
          )}
          <EmergencyDisclaimer />
        </aside>

        {/* ---------- Report FAB (mobile only) ---------- */}
        <button
          type="button"
          className={styles.fab}
          aria-label="Report an incident"
          onClick={() => navigate("/report")}
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

const formatActiveSince = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

const StaySafeCard = () => (
  <div className={styles.staySafeCard}>
    <p className={styles.staySafeTitle}>Stay Safe</p>
    <p className={styles.staySafeBody}>
      Corroborate incidents carefully to help keep the community accurate.
    </p>
  </div>
);

const EmergencyDisclaimer = () => (
  <div className={styles.disclaimerCard}>
    <p className={styles.disclaimerTitle}>Not for emergencies</p>
    <p className={styles.disclaimerBody}>
      Watchly supports community awareness, it does not replace emergency
      services. If you're in immediate danger, contact the police or your
      estate's emergency line directly.
    </p>
  </div>
);

interface CommunitySwitcherProps {
  activeCommunity: Community | null;
  otherCommunities: Community[];
  isOpen: boolean;
  onToggle: () => void;
  onSwitch: (communityId: string) => void;
}

const CommunitySwitcher = ({
  activeCommunity,
  otherCommunities,
  isOpen,
  onToggle,
  onSwitch,
}: CommunitySwitcherProps) => {
  if (!activeCommunity) {
    // LLD §7.3: zero communities joined should show the message *with*
    // a link, not just the text alone. Since there's nothing useful to
    // expand into anyway (no active community, no other communities to
    // switch between), the trigger itself becomes the link directly.
    return (
      <div className={styles.switcher}>
        <NavLink to="/communities" className={styles.switcherTrigger}>
          <MapPin size={24} />
          <span className={styles.switcherLabel}>
            <span className={styles.switcherName}>No communities joined</span>
          </span>
          <Plus size={24} />
        </NavLink>
      </div>
    );
  }

  return (
    <div className={styles.switcher}>
      <button
        type="button"
        className={styles.switcherTrigger}
        onClick={onToggle}
      >
        <MapPin size={24} />
        <span className={styles.switcherLabel}>
          <span className={styles.switcherName}>{activeCommunity.name}</span>
          <span className={styles.switcherLocation}>
            {activeCommunity.lga}, {activeCommunity.state}
          </span>
        </span>
        {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </button>

      {isOpen && (
        <div className={styles.switcherPanel}>
          {otherCommunities.map((c) => (
            <button
              key={c.community_id}
              type="button"
              className={styles.switcherItem}
              onClick={() => onSwitch(c.community_id)}
            >
              <MapPin size={16} />
              <span>
                <span className={styles.switcherName}>{c.name}</span>
                <span className={styles.switcherLocation}>
                  {c.lga}, {c.state}
                </span>
              </span>
            </button>
          ))}
          <NavLink to="/communities" className={styles.switcherJoinLink}>
            <Plus size={16} />
            Join another community
          </NavLink>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
