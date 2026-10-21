import { useEffect, useState } from "react";
import api from "../lib/api.js";
import { useUI } from "../store/ui.jsx";
import Topbar from "../fragments/Topbar.jsx";
import PageHeader from "../fragments/PageHeader.jsx";
import Card from "../elements/Card.jsx";
import Select from "../elements/Select.jsx";
import Input from "../elements/Input.jsx";
import Spinner from "../elements/Spinner.jsx";
import { useLookups } from "../hooks/useLookups.js";

export default function Timesheet() {
  const { toast } = useUI();
  const { list } = useLookups();
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!employeeId) return toast.error("Pilih karyawan dulu");
    setLoading(true);
    try {
      const res = await api.get(
        `/reports/timesheet?employeeId=${employeeId}&month=${month}`,
      );
      setRows(res.data || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const totalHours = rows.reduce((a, r) => a + (r.hours || 0), 0);

  return (
    <>
      <Topbar
        title="Timesheet"
        subtitle="Rekap jam kerja per karyawan per bulan"
      />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <PageHeader
          title="Timesheet"
          description="Derived dari log absensi (masuk/pulang otomatis dihitung)."
        />

        <Card className="mb-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select
              label="Karyawan"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              options={list("employees")}
            />
            <Input
              label="Bulan"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
            <div className="flex items-end">
              <button
                onClick={load}
                className="input-base bg-brand-600 text-white hover:bg-brand-700"
              >
                Tampilkan
              </button>
            </div>
          </div>
        </Card>

        {loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <Card>
            <p className="py-8 text-center text-sm text-ink-400">
              Pilih karyawan & bulan, lalu klik Tampilkan.
            </p>
          </Card>
        ) : (
          <Card padded={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-ink-100/60 text-xs uppercase text-ink-500">
                  <tr>
                    <th className="px-4 py-2">Tanggal</th>
                    <th className="px-4 py-2">Masuk</th>
                    <th className="px-4 py-2">Pulang</th>
                    <th className="px-4 py-2">Jam Kerja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {rows.map((r) => (
                    <tr key={r.date}>
                      <td className="px-4 py-2 font-medium text-ink-900">
                        {r.date}
                      </td>
                      <td className="px-4 py-2 text-ink-500">{r.in || "-"}</td>
                      <td className="px-4 py-2 text-ink-500">{r.out || "-"}</td>
                      <td className="px-4 py-2 text-ink-700">
                        {r.hours ? `${r.hours} jam` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-ink-50 font-semibold">
                    <td className="px-4 py-2" colSpan={3}>
                      Total
                    </td>
                    <td className="px-4 py-2">{totalHours.toFixed(2)} jam</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
