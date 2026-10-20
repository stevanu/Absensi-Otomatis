import { useCallback, useEffect, useState } from "react";
import api from "../lib/api.js";
import ENTITIES from "../lib/entities.js";
import { useUI } from "../store/ui.jsx";
import Topbar from "../fragments/Topbar.jsx";
import PageHeader from "../fragments/PageHeader.jsx";
import Card from "../elements/Card.jsx";
import Button from "../elements/Button.jsx";
import Spinner from "../elements/Spinner.jsx";
import EntityFormModal from "../fragments/EntityFormModal.jsx";

export default function Devices() {
  const { toast } = useUI();

  const cached = api.peek("/devices");

  const [devices, setDevices] = useState(cached?.data || []);

  const [found, setFound] = useState([]);

  const [loading, setLoading] = useState(!cached?.data);

  const [refreshing, setRefreshing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    async ({ force = false } = {}) => {
      const hasCache = Boolean(api.peek("/devices")?.data);

      if (!hasCache) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const res = await api.get("/devices", {
          force,
        });

        setDevices(res?.data || []);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    load();
  }, [load]);

  const scan = async () => {
    setScanning(true);

    try {
      const res = await api.post("/devices/discover", {});

      const list = Array.isArray(res?.data) ? res.data : [];

      setFound(list);

      if (!list.length) {
        toast.info("Tidak ada perangkat terdeteksi di LAN ini.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setScanning(false);
    }
  };

  const addFound = (host) => {
    const firstPort = Array.isArray(host?.ports) ? host.ports[0] : "";

    setEditing({
      name: `Mesin ${host.ip}`,
      model: "Revo W-230N",
      ip: host.ip,
      port: firstPort || "",
    });

    setModalOpen(true);
  };

  const save = async (data) => {
    setSaving(true);

    try {
      if (editing?.id) {
        await api.put(`/devices/${editing.id}`, data);
      } else {
        await api.post("/devices", data);
      }

      toast.success("Perangkat berhasil disimpan.");

      setModalOpen(false);

      await load({ force: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const test = async (device) => {
    setBusyId(`${device.id}:test`);

    try {
      const result = await api.post(`/devices/${device.id}/test`, device);

      if (result?.ok) {
        toast.success(
          result.message || `Terhubung ke ${device.ip}:${device.port}`,
        );
      } else {
        toast.error(result?.error || "Perangkat tidak dapat dihubungi.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  };

  const sync = async (device) => {
    setBusyId(`${device.id}:sync`);

    try {
      const result = await api.post(`/devices/${device.id}/sync`, device);

      if (result?.ok) {
        toast.success(
          `Sinkron selesai: ${result.inserted ?? 0} log baru, ${
            result.updated ?? 0
          } diperbarui.`,
        );
      } else {
        toast.error(result?.error || "Gagal melakukan sinkronisasi.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Topbar
        title="🔌 Perangkat"
        subtitle="Deteksi LAN dan sinkronisasi mesin absensi"
      />

      <div className="mx-auto max-w-6xl px-4 py-6">
        <PageHeader
          title="Perangkat Absensi"
          description="Temukan dan kelola mesin absensi pada jaringan lokal."
          actions={
            <Button
              onClick={() => {
                setEditing({});
                setModalOpen(true);
              }}
            >
              + Tambah Manual
            </Button>
          }
        />

        <Card title="Pindai Jaringan LAN" className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={scan} loading={scanning}>
              🔍 Pindai Sekarang
            </Button>

            <span className="text-xs text-ink-400">
              Memeriksa kandidat port yang dikonfigurasi pada server.
            </span>
          </div>

          {scanning && <Spinner label="Memindai LAN…" />}

          {!scanning && found.length > 0 && (
            <div className="mt-4 space-y-2">
              {found.map((host) => (
                <div
                  key={host.ip}
                  className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-ink-900">
                      {host.ip}
                    </p>

                    <p className="text-xs text-ink-400">
                      Port terbuka: {host.ports?.join(", ") || "-"}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => addFound(host)}
                  >
                    + Tambah
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title={`Perangkat Terdaftar (${devices.length})`}>
          {loading ? (
            <Spinner label="Memuat perangkat…" />
          ) : devices.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">
              Belum ada perangkat. Pindai LAN atau tambah manual.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-ink-500">
                  <tr>
                    <th className="px-3 py-2">Nama</th>

                    <th className="px-3 py-2">Model</th>

                    <th className="px-3 py-2">IP : Port</th>

                    <th className="px-3 py-2 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-ink-100">
                  {devices.map((device) => (
                    <tr key={device.id}>
                      <td className="px-3 py-2 font-medium text-ink-900">
                        {device.name || "Tanpa nama"}
                      </td>

                      <td className="px-3 py-2 text-ink-500">
                        {device.model || "-"}
                      </td>

                      <td className="px-3 py-2 text-ink-500">
                        {device.ip || "-"}:{device.port || "-"}
                      </td>

                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => test(device)}
                            loading={busyId === `${device.id}:test`}
                          >
                            Tes
                          </Button>

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => sync(device)}
                            loading={busyId === `${device.id}:sync`}
                          >
                            Sinkron
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditing(device);
                              setModalOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {refreshing && !loading && (
            <div className="mt-3 text-xs text-ink-400">
              Memperbarui data perangkat…
            </div>
          )}
        </Card>
      </div>

      {modalOpen && (
        <EntityFormModal
          entity={ENTITIES.devices}
          initial={editing}
          saving={saving}
          onClose={() => setModalOpen(false)}
          onSubmit={save}
        />
      )}
    </>
  );
}
