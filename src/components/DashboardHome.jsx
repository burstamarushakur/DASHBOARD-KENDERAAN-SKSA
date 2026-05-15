import { useState, useEffect } from 'react';
import { Users, Car, UserCheck, Shield, Clock, School } from 'lucide-react';
import { apiCall } from '../lib/api';

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalGuru: 0,
    totalAkp: 0,
    totalSokongan: 0,
    totalPpki: 0,
    visitorToday: 0,
    visitorActive: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      setLoading(true);

      try {
        const resp = await apiCall('getDashboardData');

        if (mounted && resp.success) {
          setStats({
            totalGuru: resp.data?.totalGuru || 0,
            totalAkp: resp.data?.totalAkp || 0,
            totalSokongan: resp.data?.totalSokongan || 0,
            totalPpki: resp.data?.totalPpki || 0,
            visitorToday: resp.data?.visitorToday || 0,
            visitorActive: resp.data?.visitorActive || 0
          });
        }
      } catch (err) {
        console.error('Fetch dashboard error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const cards = [
    {
      title: 'Kenderaan Guru',
      value: stats.totalGuru,
      subtitle: 'Kenderaan Berdaftar',
      icon: Users,
      wrapperClass: 'bg-white/5 border-white/10',
      titleClass: 'text-slate-400',
      valueClass: 'text-slate-100',
      subtitleClass: 'text-cyan-400'
    },
    {
      title: 'Kenderaan AKP',
      value: stats.totalAkp,
      subtitle: 'Kenderaan Berdaftar',
      icon: Shield,
      wrapperClass: 'bg-white/5 border-white/10',
      titleClass: 'text-slate-400',
      valueClass: 'text-slate-100',
      subtitleClass: 'text-cyan-400'
    },
    {
      title: 'Kenderaan Staf Sokongan',
      value: stats.totalSokongan,
      subtitle: 'Kenderaan Berdaftar',
      icon: UserCheck,
      wrapperClass: 'bg-white/5 border-white/10',
      titleClass: 'text-slate-400',
      valueClass: 'text-slate-100',
      subtitleClass: 'text-cyan-400'
    },
    {
      title: 'Kenderaan Ibubapa/Penjaga PPKI',
      value: stats.totalPpki,
      subtitle: 'Kenderaan Berdaftar',
      icon: School,
      wrapperClass: 'bg-purple-500/10 border-purple-500/20',
      titleClass: 'text-purple-300',
      valueClass: 'text-purple-300',
      subtitleClass: 'text-slate-400'
    },
    {
      title: 'Pelawat Hari Ini',
      value: stats.visitorToday,
      subtitle: 'Jumlah Masuk',
      icon: Car,
      wrapperClass: 'bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]',
      titleClass: 'text-cyan-400',
      valueClass: 'text-cyan-400',
      subtitleClass: 'text-slate-400'
    },
    {
      title: 'Pelawat Aktif',
      value: stats.visitorActive,
      subtitle: 'Masih Di Kawasan',
      icon: Clock,
      wrapperClass: 'bg-emerald-500/10 border-emerald-500/20',
      titleClass: 'text-emerald-400',
      valueClass: 'text-emerald-400',
      subtitleClass: 'text-slate-400'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100">
          Ringkasan Dashboard Kenderaan
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Paparan statistik kenderaan guru, AKP, staf sokongan, ibubapa/penjaga murid PPKI dan log pelawat sekolah.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className={`${card.wrapperClass} border p-4 rounded-2xl backdrop-blur-sm min-h-[132px] flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className={`text-[11px] uppercase font-bold leading-snug ${card.titleClass}`}>
                  {card.title}
                </p>

                <div className="w-9 h-9 rounded-xl bg-slate-950/40 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-slate-300" />
                </div>
              </div>

              <div>
                <p className={`text-3xl font-bold mt-3 ${card.valueClass}`}>
                  {loading ? '...' : card.value}
                </p>
                <div className={`text-[10px] mt-2 ${card.subtitleClass}`}>
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              Status Sistem
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Sistem sedang berhubung dengan Google Apps Script dan Google Sheet melalui Vercel API Proxy.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"></div>
            <span className="text-xs font-medium text-emerald-400">
              Berhubung ke GAS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}