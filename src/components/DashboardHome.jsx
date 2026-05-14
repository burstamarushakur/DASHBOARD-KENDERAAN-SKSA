import { useState, useEffect } from 'react';
import { Users, Car, UserCheck, Shield } from 'lucide-react';
import { apiCall } from '../lib/api';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalGuru: 0,
    totalAkp: 0,
    totalSokongan: 0,
    visitorToday: 0,
    visitorActive: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchDashboard = async () => {
      try {
        const resp = await apiCall('getDashboardData');
        if (mounted && resp.success) {
          setStats(resp.data || {});
        }
      } catch (err) {
        console.error('Fetch dashboard error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDashboard();
    return () => { mounted = false; };
  }, []);

  const statCards = [
    { title: 'Kenderaan Guru', value: stats.totalGuru, icon: Users, color: 'bg-blue-500', trend: 'Berdaftar' },
    { title: 'Kenderaan AKP', value: stats.totalAkp, icon: Shield, color: 'bg-indigo-500', trend: 'Berdaftar' },
    { title: 'Sokongan/Pekerja', value: stats.totalSokongan, icon: UserCheck, color: 'bg-cyan-500', trend: 'Pekerja Swasta dll' },
    { title: 'Pelawat Hari Ini', value: stats.visitorToday, icon: Car, color: 'bg-slate-600', trend: 'Melapor di pondok' },
    { title: 'Pelawat Sedang Melawat', value: stats.visitorActive, icon: ClockIcon, color: 'bg-amber-500', trend: 'Status: MASUK' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
          <p className="text-[11px] text-slate-400 uppercase font-medium">Guru</p>
          <p className="text-3xl font-bold mt-1 text-slate-100">{loading ? '...' : stats.totalGuru}</p>
          <div className="text-[10px] text-cyan-400 mt-2">Kenderaan Berdaftar</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
          <p className="text-[11px] text-slate-400 uppercase font-medium">AKP</p>
          <p className="text-3xl font-bold mt-1 text-slate-100">{loading ? '...' : stats.totalAkp}</p>
          <div className="text-[10px] text-cyan-400 mt-2">Kenderaan Berdaftar</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
          <p className="text-[11px] text-slate-400 uppercase font-medium">Sokongan</p>
          <p className="text-3xl font-bold mt-1 text-slate-100">{loading ? '...' : stats.totalSokongan}</p>
          <div className="text-[10px] text-cyan-400 mt-2">Kenderaan Berdaftar</div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl backdrop-blur-sm shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <p className="text-[11px] text-cyan-400 uppercase font-bold">Pelawat Hari Ini</p>
          <p className="text-3xl font-bold mt-1 text-cyan-400">{loading ? '...' : stats.visitorToday}</p>
          <div className="text-[10px] text-slate-400 mt-2">Jumlah Masuk</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl backdrop-blur-sm">
          <p className="text-[11px] text-emerald-400 uppercase font-bold">Aktif</p>
          <p className="text-3xl font-bold mt-1 text-emerald-400">{loading ? '...' : stats.visitorActive}</p>
          <div className="text-[10px] text-slate-400 mt-2">Masih Di Kawasan</div>
        </div>
      </div>
    </div>
  );
}

// Inline fallback icon
function ClockIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}
