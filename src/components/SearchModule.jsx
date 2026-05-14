import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { apiCall } from '../lib/api';

export default function SearchModule() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const resp = await apiCall('searchPlate', { no_kenderaan: query.trim() });
      if (resp.success) {
        setResults(resp.data || []);
      } else {
        alert(resp.message || 'Ralat semasa mencari data.');
        setResults([]);
      }
    } catch (err) {
      alert('Ralat sistem.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/40 rounded-2xl shadow-sm border border-slate-800 p-8">
        <h3 className="text-base font-semibold text-slate-100 mb-6">Carian Nombor Pendaftaran</h3>
        
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-6 text-slate-500 w-6 h-6" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              placeholder="Masukkan No Plat (contoh: JDT 1234)"
              className="w-full pl-16 pr-8 py-5 text-xl font-bold bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 uppercase transition-all text-slate-200"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Mencari...' : 'Cari'}
            </button>
          </div>
        </form>
      </div>

      {hasSearched && (
        <div className="bg-slate-900/40 rounded-2xl shadow-sm border border-slate-800 p-6">
          <h3 className="text-base font-semibold text-slate-100 mb-4">Keputusan Carian</h3>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((r, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-6 shadow-sm flex flex-col hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold rounded-md">
                      {r.kategori}
                    </span>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md border ${r.status === 'AKTIF' || r.status === 'MASUK' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                      {r.status}
                    </span>
                  </div>
                  
                  <h4 className="text-3xl font-black text-cyan-400 font-mono tracking-tight mb-2">{r.no_kenderaan}</h4>
                  <div className="text-sm text-slate-400 space-y-1 mb-4 flex-1">
                    <p className="font-semibold text-slate-200">{r.nama || r.nama_pelawat}</p>
                    {r.jenama && <p>{r.jenama} {r.model} {r.warna ? `(${r.warna})` : ''}</p>}
                    {r.tujuan && <p>Tujuan: <span className="text-slate-300">{r.tujuan}</span></p>}
                    {r.catatan && <p className="italic">Catatan: {r.catatan}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Tiada rekod ditemui untuk nombor pendaftaran <span className="font-bold text-slate-200">{query}</span>.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
