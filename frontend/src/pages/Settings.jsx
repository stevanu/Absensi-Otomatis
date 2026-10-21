import { useEffect, useState } from "react";
import api from "../lib/api.js";
import { useUI } from "../store/ui.jsx";
import Topbar from "../fragments/Topbar.jsx";
import PageHeader from "../fragments/PageHeader.jsx";
import Card from "../elements/Card.jsx";
import Button from "../elements/Button.jsx";
import Badge from "../elements/Badge.jsx";
import Spinner from "../elements/Spinner.jsx";

export default function Settings() {
  const { toast } = useUI();
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/sync/status");
      setStatus(res);
    } catch (e) {
      toast.error(e.message);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const backupNow = async () => {
    setBusy(true);
    try {
      const res = await api.post("/sync/now", {});
      if (res.ok) {
        const ok = Object.values(res.report.entities).filter(
          (e) => !e.error,
        ).length;
        toast.success(`Backup selesai: ${ok} entitas disalin ke MySQL`);
        load();
      } else {
        toast.error(res.error || "Gagal backup");
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Topbar
        title="Pengaturan"
        subtitle="Penyimpanan, pencadangan & integrasi"
      />
      <div className="mx-auto max-w-3xl px-4 py-6">
        <PageHeader
          title="Pengaturan & Pencadangan"
          description="Google Sheets sebagai penyimpanan utama; MySQL sebagai cadangan otomatis setiap 12 jam."
        />

        {!status ? (
          <Spinner />
        ) : (
          <>
            <Card className="mb-4">
              <h3 className="mb-3 text-sm font-semibold text-ink-900">
                Status Integrasi
              </h3>
              <div className="space-y-2 text-sm">
                <Row
                  label="Google Sheets (utama)"
                  value={
                    <Badge tone={status.sheets ? "success" : "danger"}>
                      {status.sheets ? "Terhubung" : "Belum diatur"}
                    </Badge>
                  }
                />
                <Row
                  label="MySQL (cadangan)"
                  value={
                    <span className="flex items-center gap-2">
                      <Badge
                        tone={status.mysql.connected ? "success" : "danger"}
                      >
                        {status.mysql.connected ? "Terhubung" : "Gagal"}
                      </Badge>
                    </span>
                  }
                />

                <Row
                  label="AI Agent"
                  value={
                    <Badge tone={status.ai ? "success" : "neutral"}>
                      {status.ai ? "Aktif" : "Nonaktif"}
                    </Badge>
                  }
                />
                <Row
                  label="Jadwal Sync"
                  value={
                    <span className="text-ink-600">
                      Setiap 12 jam (00:00 & 12:00)
                    </span>
                  }
                />
                {status.sync.lastRun && (
                  <Row
                    label="Sync Terakhir"
                    value={
                      <span className="text-ink-600">
                        {new Date(status.sync.lastRun).toLocaleString("id-ID")}
                      </span>
                    }
                  />
                )}
              </div>
            </Card>

            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    Pencadangan Manual
                  </p>
                  <p className="text-xs text-ink-500">
                    Tarik semua data dari Google Sheets ke MySQL sekarang juga.
                  </p>
                </div>
                <Button onClick={backupNow} loading={busy}>
                  💾 Cadangkan Sekarang
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 py-1.5 last:border-0">
      <span className="text-ink-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}
