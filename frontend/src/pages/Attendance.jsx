import { useCallback, useEffect, useState } from "react";

import api from "../lib/api.js";
import ENTITIES from "../lib/entities.js";
import { useUI } from "../store/ui.jsx";

import Topbar from "../fragments/Topbar.jsx";
import PageHeader from "../fragments/PageHeader.jsx";
import Card from "../elements/Card.jsx";
import Input from "../elements/Input.jsx";
import Select from "../elements/Select.jsx";
import CrudTable from "../fragments/CrudTable.jsx";
import Spinner from "../elements/Spinner.jsx";

import { useLookups } from "../hooks/useLookups.js";

export default function Attendance() {
  const { toast } = useUI();
  const { list } = useLookups();

  /*
    FILTER STATE
   */

  const [employeeId, setEmployeeId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  /*
    DATA STATE
   */

  const initial = api.peek("/attendance");

  const [rows, setRows] = useState(
    Array.isArray(initial?.data) ? initial.data : [],
  );

  const [loading, setLoading] = useState(!initial);
  const [refreshing, setRefreshing] = useState(false);

  /*
    LOAD ATTENDANCE
   */

  const load = useCallback(
    async ({
      employee = employeeId,
      startDate = from,
      endDate = to,
      force = false,
    } = {}) => {
      const params = new URLSearchParams();

      if (employee) {
        params.set("employeeId", employee);
      }

      if (startDate) {
        params.set("from", startDate);
      }

      if (endDate) {
        params.set("to", `${endDate}T23:59:59`);
      }

      const query = params.toString();

      const path = query ? `/attendance?${query}` : "/attendance";

      const cached = api.peek(path);

      if (!cached) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const res = await api.get(path, {
          force,
        });

        const nextRows = Array.isArray(res?.data) ? res.data : [];

        setRows(nextRows);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Gagal mengambil data absensi.";
        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [employeeId, from, to, toast],
  );

  /*
    INITIAL LOAD
   */

  useEffect(() => {
    load();
  }, [load]);

  /*
    APPLY FILTER
   */

  const handleFilter = () => {
    load({
      force: true,
    });
  };

  /*
    RESET FILTER
   */

  const handleReset = () => {
    setEmployeeId("");
    setFrom("");
    setTo("");

    load({
      employee: "",
      startDate: "",
      endDate: "",
      force: true,
    });
  };

  /*
    RENDER
   */

  return (
    <>
      <Topbar
        title="Log Absensi"
        subtitle="Data kehadiran dari perangkat absensi"
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader
          title="Log Absensi"
          description="Riwayat tap dari perangkat absensi yang telah diproses dan dideduplikasi."
        />

        <Card className="mb-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Filter Absensi
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Gunakan filter untuk menampilkan data tertentu.
                </p>
              </div>

              {/* Background refresh indicator */}
              {refreshing && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  Memperbarui...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {/* Karyawan */}
              <Select
                label="Karyawan"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                options={list("employees")}
              />

              {/* Dari */}
              <Input
                label="Dari"
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
              />

              {/* Sampai */}
              <Input
                label="Sampai"
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
              />

              {/* Actions */}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={handleFilter}
                  disabled={loading}
                  className="
                    inline-flex h-10 flex-1
                    items-center justify-center
                    rounded-lg
                    bg-blue-600
                    px-4
                    text-sm font-medium
                    text-white
                    shadow-sm
                    transition-colors
                    hover:bg-blue-700
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500/40
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Memuat...
                    </span>
                  ) : (
                    "Terapkan"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="
                    inline-flex h-10
                    items-center justify-center
                    rounded-lg
                    border border-slate-200
                    bg-white
                    px-4
                    text-sm font-medium
                    text-slate-600
                    shadow-sm
                    transition-colors
                    hover:bg-slate-50
                    hover:text-slate-900
                    focus:outline-none
                    focus:ring-2
                    focus:ring-slate-300
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          {/* Table header */}
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Riwayat Absensi
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {rows.length.toLocaleString("id-ID")} data ditemukan
                </p>
              </div>

              {refreshing && (
                <div
                  className="
                    hidden items-center gap-2
                    text-xs text-slate-400
                    sm:flex
                  "
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                  Sinkronisasi data
                </div>
              )}
            </div>
          </div>

          {/* Initial loading */}
          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <Spinner />
            </div>
          ) : rows.length === 0 ? (
            /* Empty state */
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <svg
                  className="h-6 w-6 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="4" y="3" width="16" height="18" rx="2" />

                  <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
              </div>

              <h3 className="text-sm font-semibold text-slate-700">
                Tidak ada data absensi
              </h3>

              <p className="mt-1 max-w-sm text-xs text-slate-500">
                Tidak ditemukan data yang sesuai dengan filter yang dipilih.
              </p>
            </div>
          ) : (
            /* Data */
            <CrudTable entity={ENTITIES.attendance_log} rows={rows} />
          )}
        </Card>
      </main>
    </>
  );
}
