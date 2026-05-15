import { useState, useEffect } from 'react';
import { Users, Car, UserCheck, Shield, Clock, School, LogIn, AlertCircle } from 'lucide-react';
import { apiCall } from '../lib/api';

function getTodayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeDateKey(value) {
  const str = String(value || '').trim();

  if (!str) return '';

  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }

  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const dd = slashMatch[1].padStart(2, '0');
    const mm = slashMatch[2].padStart(2, '0');
    const yyyy = slashMatch[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  return str;
}

function VisitorCard({ visitor, active = false }) {
  return (
    <div className={`rounded-xl border p-4 ${
      active
        ? 'bg-emerald-500/10 border-emerald-500/20'
        : 'bg-slate-950/60 border-slate-800'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono text-xl font-black text-cyan-400 tracking-tight">
              {visitor.no_kenderaan || '-'}
            </span>

            <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${
              String(visitor.status || '').toUpperCase() === 'MASUK'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {visitor.status || '-'}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-100">
              {visitor.nama_pelawat || '-'}
            </p>

            <p className="text-xs text-slate-400">
              Tujuan: <span className="text-slate-200">{visitor.tujuan || '-'}</span>
            </p>

            <p className="text-xs text-slate-400">
              Jumpa: <span className="text-slate-200">{visitor.jumpa_siapa || '-'}</span>
            </p>
          </div>
        </div>

        <div className="lg:text-right shrink-0">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Masa Masuk
          </p>
          <p className="text-sm font-bold text-slate-200">
            {visitor.masa_masuk || '-'}
          </p>

          <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-2">
            Masa Keluar
          </p>
          <p className={`text-sm font-bold ${visitor.masa_keluar ? 'text-slate-200' : 'text-emerald-400'}`}>
            {visitor.masa_keluar || 'MASIH DI KAWASAN'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const [stats, setStats] = useState({
    totalGuru: 0,
    totalAkp: 0,
    totalSokongan: 0,
    totalPpki: 0,
    visitorToday: 0,
    visitorActive: 0
  });

  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingVisitors, setLoadingVisitors] = useState(true);

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

    const fetchVisitors = async () => {
      setLoadingVisitors(true);

      try {
        const resp = await apiCall('listVisitors', {});

        if (mounted && resp.success) {
          setVisitors(Array.isArray(resp.data) ? resp.data : []);
        } else {
          setVisitors([]);
        }
      } catch (err) {
        console.error('Fetch visitors error:', err);
        setVisitors([]);
      } finally {
        if (mounted) {
          setLoadingVisitors(false);
        }
      }
    };

    fetchDashboard();
    fetchVisitors();

    return () => {
      mounted = false;
    };
  }, []);

  const todayKey = getTodayKey();

  const visitorsToday = visitors.filter((visitor) => {
    const dateKey = normalizeDateKey(visitor.tarikh || visitor.timestamp_masuk);
    return dateKey === todayKey;
  });

  const activeVisitors = visitors.filter((visitor) => {
    const status = String(visitor.status || '').toUpperCase().trim();
    const masaKeluar = String(visitor.masa_keluar || '').trim();

    return status === 'MASUK' || (!masaKeluar && status !== 'KELUAR');
  });

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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-slate-900/40 border border-cyan-500/20 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 bg-cyan-500/5 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <LogIn className="w-5 h-5 text-cyan-400" />
                <h4 className="text-base font-bold text-cyan-400">
                  Pelawat Hari Ini
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Senarai kenderaan pelawat yang direkodkan pada hari ini.
              </p>
            </div>

            <div className="text-right">
              <p className="text-4xl font-black text-cyan-400">
                {loadingVisitors ? '...' : visitorsToday.length}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Rekod Hari Ini
              </p>
            </div>
          </div>

          <div className="p-5 space-y-3 max-h-[420px] overflow-y-auto">
            {loadingVisitors ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                Memuatkan data pelawat...
              </div>
            ) : visitorsToday.length > 0 ? (
              visitorsToday.slice(0, 8).map((visitor) => (
                <VisitorCard
                  key={visitor.id || `${visitor.no_kenderaan}-${visitor.masa_masuk}`}
                  visitor={visitor}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-8 h-8 text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-400">
                  Tiada rekod pelawat hari ini.
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Data akan dipaparkan selepas borang pelawat diisi.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-emerald-500/20 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 bg-emerald-500/5 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h4 className="text-base font-bold text-emerald-400">
                  Pelawat Aktif / Masih Di Kawasan
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Kenderaan pelawat yang masih belum direkodkan keluar.
              </p>
            </div>

            <div className="text-right">
              <p className="text-4xl font-black text-emerald-400">
                {loadingVisitors ? '...' : activeVisitors.length}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Masih Aktif
              </p>
            </div>
          </div>

          <div className="p-5 space-y-3 max-h-[420px] overflow-y-auto">
            {loadingVisitors ? (
              <div className="flex items-center justify-center py-12 text-slate-500">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                Memuatkan data pelawat aktif...
              </div>
            ) : activeVisitors.length > 0 ? (
              activeVisitors.slice(0, 8).map((visitor) => (
                <VisitorCard
                  key={visitor.id || `${visitor.no_kenderaan}-${visitor.masa_masuk}`}
                  visitor={visitor}
                  active
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-8 h-8 text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-400">
                  Tiada pelawat aktif.
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Semua pelawat telah direkodkan keluar atau belum ada pelawat masuk.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}