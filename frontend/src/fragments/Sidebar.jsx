import { NavLink } from "react-router-dom";
import { useUI } from "../store/ui.jsx";

/* Icons */

const Icon = ({ children, className = "h-5 w-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const icons = {
  dashboard: (
    <Icon>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  ),

  ai: (
    <Icon>
      <path d="M12 3v2" />
      <path d="M12 19v2" />
      <path d="M3 12h2" />
      <path d="M19 12h2" />
      <path d="m5.6 5.6 1.4 1.4" />
      <path d="m17 17 1.4 1.4" />
      <path d="m18.4 5.6-1.4 1.4" />
      <path d="m7 17-1.4 1.4" />
      <circle cx="12" cy="12" r="4" />
    </Icon>
  ),

  device: (
    <Icon>
      <rect x="5" y="2.5" width="14" height="19" rx="2" />
      <path d="M9 6h6" />
      <circle cx="12" cy="18" r="1" />
    </Icon>
  ),

  attendance: (
    <Icon>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </Icon>
  ),

  timesheet: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  ),

  report: (
    <Icon>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="m7 15 3-4 3 2 4-6" />
    </Icon>
  ),

  company: (
    <Icon>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h2M14 8h2" />
      <path d="M8 12h2M14 12h2" />
      <path d="M8 16h2M14 16h2" />
    </Icon>
  ),

  department: (
    <Icon>
      <rect x="3" y="4" width="7" height="6" rx="1" />
      <rect x="14" y="4" width="7" height="6" rx="1" />
      <rect x="8.5" y="14" width="7" height="6" rx="1" />
      <path d="M6.5 10v2h11v-2" />
      <path d="M12 12v2" />
    </Icon>
  ),

  office: (
    <Icon>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Icon>
  ),

  position: (
    <Icon>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </Icon>
  ),

  employee: (
    <Icon>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </Icon>
  ),

  shift: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  ),

  schedule: (
    <Icon>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </Icon>
  ),

  rules: (
    <Icon>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.2-1.7l1.4-1.1-2-3.4-1.7.7a7 7 0 0 0-2.9-1.7L13.4 3h-4l-.3 1.8a7 7 0 0 0-2.9 1.7l-1.7-.7-2 3.4 1.4 1.1a7 7 0 0 0 0 3.4l-1.4 1.1 2 3.4 1.7-.7a7 7 0 0 0 2.9 1.7l.3 1.8h4l.3-1.8a7 7 0 0 0 2.9-1.7l1.7.7 2-3.4-1.4-1.1c.1-.5.2-1.1.2-1.7Z" />
    </Icon>
  ),

  leave: (
    <Icon>
      <path d="M6 20h12" />
      <path d="M8 20V9a4 4 0 0 1 8 0v11" />
      <path d="M10 6c0-2 1-3 2-4 1 1 2 2 2 4" />
    </Icon>
  ),

  request: (
    <Icon>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </Icon>
  ),

  overtime: (
    <Icon>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  ),

  holiday: (
    <Icon>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3 6.3 17.7" />
    </Icon>
  ),

  users: (
    <Icon>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 11a3 3 0 1 0 0-6" />
      <path d="M18 14a5 5 0 0 1 3 4" />
    </Icon>
  ),

  settings: (
    <Icon>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.2-1.7l1.4-1.1-2-3.4-1.7.7a7 7 0 0 0-2.9-1.7L13.4 3h-2.8l-.3 1.8a7 7 0 0 0-2.9 1.7l-1.7-.7-2 3.4 1.4 1.1a7 7 0 0 0 0 3.4l-1.4 1.1 2 3.4 1.7-.7a7 7 0 0 0 2.9 1.7l.3 1.8h2.8l.3-1.8a7 7 0 0 0 2.9-1.7l1.7.7 2-3.4-1.4-1.1c.1-.5.2-1.1.2-1.7Z" />
    </Icon>
  ),
};

/* Menu */

const GROUPS = [
  {
    title: "Utama",
    items: [
      { to: "/", label: "Dashboard", icon: icons.dashboard, end: true },
      { to: "/ai", label: "Asisten AI", icon: icons.ai },
    ],
  },
  {
    title: "Kehadiran",
    items: [
      { to: "/devices", label: "Perangkat", icon: icons.device },
      { to: "/attendance", label: "Log Absensi", icon: icons.attendance },
      { to: "/timesheet", label: "Timesheet", icon: icons.timesheet },
      { to: "/reports", label: "Laporan", icon: icons.report },
    ],
  },
  {
    title: "Organisasi",
    items: [
      { to: "/e/companies", label: "Perusahaan", icon: icons.company },
      { to: "/e/departments", label: "Departemen", icon: icons.department },
      { to: "/e/offices", label: "Kantor", icon: icons.office },
      { to: "/e/positions", label: "Posisi", icon: icons.position },
      { to: "/e/employees", label: "Karyawan", icon: icons.employee },
    ],
  },
  {
    title: "Waktu & Pengajuan",
    items: [
      { to: "/e/shifts", label: "Shift", icon: icons.shift },
      { to: "/e/schedules", label: "Jadwal", icon: icons.schedule },
      { to: "/e/rules", label: "Aturan", icon: icons.rules },
      { to: "/e/leaves", label: "Jenis Cuti & Izin", icon: icons.leave },
      { to: "/e/leave_requests", label: "Pengajuan Cuti", icon: icons.request },
      {
        to: "/e/overtime_categories",
        label: "Kategori Lembur",
        icon: icons.overtime,
      },
      {
        to: "/e/overtime_requests",
        label: "Pengajuan Lembur",
        icon: icons.request,
      },
      {
        to: "/e/holidays",
        label: "Hari Libur",
        icon: icons.holiday,
      },
    ],
  },
  {
    title: "Sistem",
    items: [
      { to: "/e/users", label: "Pengguna", icon: icons.users },
      { to: "/settings", label: "Pengaturan", icon: icons.settings },
    ],
  },
];

/* =========================================================
 * Sidebar
 * ========================================================= */

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUI();

  const closeMobileSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={() => setSidebarOpen(false)}
          className="
            fixed inset-0 z-40
            bg-slate-950/40
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      <aside
        className={[
          /*
           * Main sidebar:
           * Navy gelap, bukan hitam pekat.
           */
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col",
          "bg-slate-950 text-slate-300",
          "border-r border-slate-800/80",
          "shadow-xl shadow-slate-950/20",

          /*
           * Animation
           */
          "transition-transform duration-200 ease-out",

          /*
           * Desktop
           */
          "lg:sticky lg:top-0 lg:z-30",
          "lg:h-screen lg:translate-x-0",
          "lg:shadow-none",

          /*
           * Mobile
           */
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* =====================================================
         * Brand
         * ===================================================== */}

        <div className="flex h-16 shrink-0 items-center border-b border-slate-800/80 px-5">
          <div className="flex min-w-0 items-center gap-3">
            {/* Logo */}
            <div
              className="
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-lg
                bg-blue-600
                text-sm font-bold text-white
                shadow-sm
              "
            >
              F
            </div>

            {/* Brand text */}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-white">
                Fingerspot Web
              </p>

              <p className="mt-0.5 text-[11px] text-slate-500">
                HR & Attendance
              </p>
            </div>
          </div>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup navigasi"
            className="
              ml-auto rounded-lg p-2
              text-slate-500
              transition-colors
              hover:bg-slate-900
              hover:text-white
              lg:hidden
            "
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {/* =====================================================
         * Navigation
         * ===================================================== */}

        <nav
          aria-label="Navigasi utama"
          className="flex-1 overflow-y-auto px-3 py-5"
        >
          <div className="space-y-7">
            {GROUPS.map((group) => (
              <section key={group.title}>
                {/* Section title */}
                <div className="mb-2 px-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                    {group.title}
                  </p>
                </div>

                {/* Menu */}
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={closeMobileSidebar}
                      className={({ isActive }) =>
                        [
                          "group relative flex items-center gap-3",
                          "rounded-lg px-3 py-2.5",
                          "text-[13px] font-medium",
                          "transition-colors duration-150",

                          "focus:outline-none",
                          "focus-visible:ring-2",
                          "focus-visible:ring-blue-500/50",

                          isActive
                            ? [
                                /*
                                 * Active:
                                 * biru sangat lembut, tidak mencolok.
                                 */
                                "bg-blue-500/10",
                                "text-blue-400",
                              ].join(" ")
                            : [
                                "text-slate-400",
                                "hover:bg-slate-900",
                                "hover:text-slate-100",
                              ].join(" "),
                        ].join(" ")
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active indicator */}
                          {isActive && (
                            <span
                              className="
                                absolute left-0 top-1/2
                                h-5 w-0.5
                                -translate-y-1/2
                                rounded-full
                                bg-blue-500
                              "
                              aria-hidden="true"
                            />
                          )}

                          {/* Icon */}
                          <span
                            className={[
                              "flex h-5 w-5 shrink-0 items-center justify-center",
                              isActive
                                ? "text-blue-400"
                                : "text-slate-500 group-hover:text-slate-300",
                            ].join(" ")}
                          >
                            {item.icon}
                          </span>

                          {/* Label */}
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </nav>

        {/* =====================================================
         * Footer
         * ===================================================== */}

        <div className="shrink-0 border-t border-slate-800/80 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-600">
                System
              </p>

              <p className="mt-0.5 text-[11px] text-slate-500">Google Sheets</p>
            </div>

            <span
              className="
                rounded-md
                border border-slate-800
                bg-slate-900
                px-2 py-1
                text-[10px]
                font-medium
                text-slate-500
              "
            >
              v1.0.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
