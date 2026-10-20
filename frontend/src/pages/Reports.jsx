import { useState } from 'react';
import api from '../lib/api.js';
import { useUI } from '../store/ui.jsx';
import Topbar from '../fragments/Topbar.jsx';
import PageHeader from '../fragments/PageHeader.jsx';
import Card from '../elements/Card.jsx';
import Input from '../elements/Input.jsx';
import Stat from '../elements/Stat.jsx';
import Spinner from '../elements/Spinner.jsx';

export default function Reports() {
  const { toast } = useUI();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [summary, setSummary] = useState(null);
  const [recap, setRecap] = useState([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (from) p.set('from', from);
      if (to) p.set('to', to + 'T23:59');
      const [s, r] = await Promise.all([
        api.get(`/reports/summary?${p}`),
        api.get(`/reports/recap?${p}`),
      ]);
      setSummary(s.data);
      setRecap(r.data || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Topbar title="📈 Laporan" subtitle="Rekap kehadiran & rekapitulasi" />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <PageHeader title="Laporan Kehadiran" description="Rentang waktu opsional. Kosongkan untuk seluruh periode." />

        <Card className="mb-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input label="Dari" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input label="Sampai" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            <div className="flex items-end">
              <button onClick={run} className="input-base bg-brand-600 text-white hover:bg-brand-700">Buat Laporan</button>
            </div>
          </div>
        </Card>

        {loading ? (
          <Spinner />
        ) : !summary ? (
          <Card><p className="py-8 text-center text-sm text-ink-400">Atur rentang lalu klik Buat Laporan.</p></Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat tone="brand" icon="👥" label="Karyawan" value={summary.totalKaryawan} />
              <Stat tone="success" icon="✅" label="Hadir Unik" value={summary.hadirUnik} />
              <Stat tone="warning" icon="⏰" label="Telat" value={summary.telat} />
              <Stat tone="info" icon="🌴" label="Izin/Cuti Disetujui" value={summary.izinCutiDisetujui} />
            </div>

            <Card title="Rekapitulasi per Departemen" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-ink-500">
                    <tr>
                      <th className="px-3 py-2">Departemen</th>
                      <th className="px-3 py-2">Karyawan</th>
                      <th className="px-3 py-2">Hadir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {recap.map((d) => (
                      <tr key={d.departemen}>
                        <td className="px-3 py-2 font-medium text-ink-900">{d.departemen}</td>
                        <td className="px-3 py-2 text-ink-500">{d.karyawan}</td>
                        <td className="px-3 py-2 text-ink-500">{d.hadir}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
