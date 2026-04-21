import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { Shield, ChevronLeft, ChevronRight, LogOut, User } from "lucide-react";
import { selectAuthUser } from "@/features/auth/model/selectors";
import { useLogout } from "@/features/auth/hooks";
import Button from "@/components/Button";
import { faChartLine, faFileLines } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/dashboard", icon: faChartLine, label: "Dashboard" },
  { to: "/applications", icon: faFileLines, label: "My Applications" },
];

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const user = useSelector(selectAuthUser);
  const { logout } = useLogout();

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.surname?.[0] ?? ""}`.toUpperCase()
    : "??";

  return (
    <aside
      className={`
        relative flex flex-col border-r border-primary-foreground/10 bg-gradient-to-b from-primary to-primary/95 transition-all duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-64"}
      `}
      aria-label="Main navigation"
    >
      {/* Brand header */}
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-primary-foreground/10 px-4">
        <Shield
          className="size-7 shrink-0 text-primary-foreground/90"
          aria-hidden
        />
        {!collapsed && (
          <p className="truncate text-[11px] font-semibold leading-tight tracking-tight text-white">
            RNEC{" "}
            <span className="block text-[9px] font-normal uppercase tracking-[0.1em] text-white/70">
              Rwanda
            </span>
          </p>
        )}
      </header>

      {/* Nav links */}
      <nav
        className="flex-1 overflow-y-auto px-2.5 py-5"
        aria-label="App sections"
      >
        <ul className="flex flex-col gap-1.5">
          {navItems.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `group flex cursor-pointer items-center gap-3 ${collapsed ? "justify-center rounded-md! px-2 py-2.5" : "rounded-md! px-3.5 py-2.5"} text-[12px]! font-normal transition-all duration-150
                  ${
                    isActive
                      ? "bg-white/16 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <FontAwesomeIcon
                  icon={icon}
                  className={`size-4 shrink-0 transition-transform duration-150 ${collapsed ? "" : "group-hover:scale-105"}`}
                  aria-hidden
                />
                {!collapsed && label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User + logout */}
      <footer className="border-t border-primary-foreground/10 px-2.5 py-3">
        <section
          className={`mb-2 flex items-center gap-2.5 rounded-xl bg-white/5 px-3 py-2.5 ${collapsed ? "justify-center" : ""}`}
          aria-label="Current user"
        >
          <figure className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 text-[10px] font-bold text-primary-foreground">
            {initials}
          </figure>
          {!collapsed && (
            <p className="min-w-0 flex-1">
              <span className="block truncate text-[10px] font-normal leading-tight text-white">
                {user?.firstName} {user?.surname}
              </span>
              <span className="block truncate text-[9px] leading-tight text-white/50">
                Applicant
              </span>
            </p>
          )}
        </section>

        <Button
          onClick={logout}
          value={collapsed ? null : "Log out"}
          className="text-[12px] w-full"
        >
          <LogOut className="size-3 shrink-0" aria-hidden />
          {!collapsed && `Log out`}
        </Button>
      </footer>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className={`absolute -right-3 top-20 z-10 flex size-6 cursor-pointer items-center justify-center rounded-full border border-primary/20 shadow-sm transition-colors duration-150
          ${
            collapsed
              ? "bg-primary text-white hover:bg-primary/90 hover:text-white"
              : "bg-white text-primary hover:bg-primary hover:text-primary-foreground"
          }
        `}
      >
        <span className="flex h-full w-full items-center justify-center">
          {collapsed ? (
            <ChevronRight className="size-3 text-white" aria-hidden />
          ) : (
            <ChevronLeft className="size-3 text-primary" aria-hidden />
          )}
        </span>
      </button>
    </aside>
  );
}

/* ── Mobile drawer variant ────────────────────────────────────────────────── */

export function MobileSidebarContent() {
  const user = useSelector(selectAuthUser);
  const { logout } = useLogout();

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.surname?.[0] ?? ""}`.toUpperCase()
    : "??";

  return (
    <aside
      className="flex h-full flex-col bg-gradient-to-b from-primary to-primary/95"
      aria-label="Mobile navigation"
    >
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-primary-foreground/10 px-5">
        <Shield
          className="size-7 shrink-0 text-primary-foreground/90"
          aria-hidden
        />
        <p className="text-[11px] font-semibold leading-tight tracking-tight text-white">
          RNEC{" "}
          <span className="block text-[9px] font-normal uppercase tracking-[0.1em] text-white/70">
            Rwanda
          </span>
        </p>
      </header>

      <nav
        className="flex-1 overflow-y-auto px-3 py-4"
        aria-label="App sections"
      >
        <ul className="flex flex-col gap-1.5">
          {navItems.map(({ to, icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `group flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-[12px]! font-normal transition-all duration-150
                  ${
                    isActive
                      ? "bg-white/16 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <FontAwesomeIcon
                  icon={icon}
                  className="size-4 shrink-0 group-hover:scale-105 transition-transform duration-150"
                  aria-hidden
                />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="border-t border-primary-foreground/10 px-3 py-4">
        <section
          className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5"
          aria-label="Current user"
        >
          <figure className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 text-[11px] font-bold text-primary-foreground">
            {initials}
          </figure>
          <p className="min-w-0 flex-1">
            <span className="block truncate text-[10px] font-normal leading-tight text-white">
              {user?.firstName} {user?.surname}
            </span>
            <span className="block truncate text-[9px] leading-tight text-white/50">
              Applicant
            </span>
          </p>
          <User className="size-4 text-primary-foreground/30" aria-hidden />
        </section>

        <Button
          onClick={logout}
          className="w-full gap-3 rounded-xl border-none bg-transparent px-3 py-2.5 text-[10px] font-normal text-white/80 transition-colors duration-150 hover:bg-white/12 hover:text-white"
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          <span>Log out</span>
        </Button>
      </footer>
    </aside>
  );
}
