import { useState, useEffect } from 'react';
import { Users, LogIn, LogOut, Clock, Calendar } from 'lucide-react';
import { apiCall } from '../lib/api';

export default function VisitorModule() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await apiCall('listVisitors', {});
      if (resp.success) {
        setData(resp.data || []);
      } else {
        alert(resp.message || 'Mengalami ralat semasa mengambil senarai pelawat.');
      }
    } catch (err) {
      alert('Ralat sistem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100">Log Pelawat Terkini</h3>
          <p className="text-xs text-slate-400">Paparan log pelawat keluar/masuk kawasan sekolah.</p>
        </div>
        <button 
          onClick={fetchData}
          className="text-xs text-cyan-400 hover:underline"
        >
          Refresh Data
        </button>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-800/50 text-slate-400 font-medium text-xs">
               <tr>
                 <th className="px-6 py-4">Tarikh & Masa Masuk</th>
                 <th className="px-6 py-4">Pelawat / Jumpa</th>
                 <th className="px-6 py-4">No Plat</th>
                 <th className="px-6 py-4 border-l border-slate-800/50">Tujuan</th>
                 <th className="px-6 py-4">Masa Keluar</th>
                 <th className="px-6 py-4 text-center">Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-800/50">
               {loading ? (
                 <tr>
                   <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                     <div className="flex items-center justify-center space-x-2">
                       <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                       <span>Memuatkan data...</span>
                     </div>
                   </td>
                 </tr>
               ) : data.length === 0 ? (
                 <tr>
                   <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Tiada log pelawat ditemui.</td>
                 </tr>
               ) : (
                 data.map((row) => (
                   <tr key={row.id} className="hover:bg-white/5 transition-colors text-slate-300">
                     <td className="px-6 py-4">
                       <div className="flex flex-col space-y-1">
                         <span className="text-slate-200">{row.tarikh}</span>
                         <span className="text-xs text-slate-400">{row.masa_masuk}</span>
                       </div>
                     </td>
                     <td className="px-6 py-4">
                       <div className="font-medium text-slate-200">{row.nama_pelawat}</div>
                       <div className="text-xs text-slate-500">Jumpa: <span className="text-slate-400">{row.jumpa_siapa}</span></div>
                     </td>
                     <td className="px-6 py-4">
                       <span className="font-mono text-cyan-400">
                         {row.no_kenderaan}
                       </span>
                     </td>
                     <td className="px-6 py-4 border-l border-slate-800/50">
                        <div className="max-w-[200px] truncate" title={row.tujuan}>{row.tujuan}</div>
                     </td>
                     <td className="px-6 py-4 text-slate-400">{row.masa_keluar || '-'}</td>
                     <td className="px-6 py-4 text-center">
                       {row.status === 'MASUK' ? (
                         <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                           MASUK
                         </span>
                       ) : (
                         <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-slate-800 text-slate-500 border border-slate-700">
                           KELUAR
                         </span>
                       )}
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
