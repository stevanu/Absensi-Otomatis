import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";
import { useUI } from "../store/ui.jsx";
import Topbar from "../fragments/Topbar.jsx";
import PageHeader from "../fragments/PageHeader.jsx";
import Stat from "../elements/Stat.jsx";
import Card from "../elements/Card.jsx";
import Spinner from "../elements/Spinner.jsx";
import Badge from "../elements/Badge.jsx";
import { useLookups } from "../hooks/useLookups.js";

export default function Dashboard() {
  const { toast } = useUI();
  const { label } = useLookups();
  const [summary, setSummary] = useState(null);
  const [recap, setRecap] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, r, a] = await Promise.all([
          api.get("/reports/summary"),
          api.get("/reports/recap"),
          api.get("/attendance?limit=8"),
        ]);
        setSummary(s.data);
        setRecap(r.data || []);
        setRecent(a.data || []);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  if (loading) return <Spinner label="Memuat dashboard…" />;

  const maxHadir = Math.max(1, ...recap.map((d) => d.hadir));

  return (
    <>
      <Topbar title="📊 Dashboard" subtitle="Ringkasan kehadiran real-time" />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <PageHeader
          title="Dashboard Kehadiran"
          description="Angka di bawah dihitung langsung dari data Google Sheets."
          actions={
            <Link to="/ai">
              <Badge tone="brand">🤖 Tanya Asisten AI</Badge>
            </Link>
          }
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            tone="brand"
            icon="👥"
            label="Total Karyawan"
            value={summary?.totalKaryawan ?? 0}
          />
          <Stat
            tone="success"
            icon="✅"
            label="Hadir (unik)"
            value={summary?.hadirUnik ?? 0}
          />
          <Stat
            tone="warning"
            icon="⏰"
            label="Telat"
            value={summary?.telat ?? 0}
          />
          <Stat
            tone="danger"
            icon="🚫"
            label="Tidak Hadir"
            value={summary?.tidakHadir ?? 0}
          />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card title="Kehadiran per Departemen" className="lg:col-span-2">
            {recap.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">
                Belum ada data departemen/karyawan.
              </p>
            ) : (
              <div className="space-y-3">
                {recap.map((d) => (
                  <div key={d.departemen}>
                    <div className="mb-1 flex justify-between text-xs text-ink-600">
                      <span>{d.departemen}</span>
                      <span>
                        {d.hadir}/{d.karyawan}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${(d.hadir / maxHadir) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card title="Log Absensi Terbaru">
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">
                Belum ada log absensi.
              </p>
            ) : (
              <ul className="divide-y divide-ink-100 text-sm">
                {recent.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="truncate text-ink-700">
                      {label("employees", r.employeeId)}
                    </span>
                    <span className="text-xs text-ink-500">{r.datetime}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {summary?.rentang && (
          <p className="mt-4 text-xs text-ink-400">
            Periode terbaca: {summary.rentang.from || "awal"} s/d{" "}
            {summary.rentang.to || "sekarang"}
          </p>
        )}
      </div>
    </>
  );
}
