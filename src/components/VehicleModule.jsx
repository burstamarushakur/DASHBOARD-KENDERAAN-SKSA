import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { apiCall } from '../lib/api';

export default function VehicleModule({ title, kategori }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    no_ic: '',
    password: '',
    nama: '',
    no_kenderaan: '',
    jenama: '',
    model: '',
    warna: '',
    status: 'AKTIF',
    catatan: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await apiCall('listVehicles', { kategori });
      if (resp.success) {
        setData(resp.data || []);
      } else {
        alert(resp.message || `Ralat memuat turun senarai ${kategori}`);
      }
    } catch (err) {
      alert('Ralat sistem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [kategori]);

  const handleOpenModal = (row = null) => {
    if (row) {
      setEditingId(row.id);
      setFormData({
        no_ic: row.no_ic || '',
        password: '', // require re-entry of password on edit? yes
        nama: row.nama || '',
        no_kenderaan: row.no_kenderaan || '',
        jenama: row.jenama || '',
        model: row.model || '',
        warna: row.warna || '',
        status: row.status || 'AKTIF',
        catatan: row.catatan || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        no_ic: '',
        password: '',
        nama: '',
        no_kenderaan: '',
        jenama: '',
        model: '',
        warna: '',
        status: 'AKTIF',
        catatan: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.password !== 'sksajba5095') {
       alert('Kata laluan tidak tepat. Sila cuba lagi.');
       return;
    }
    setSaving(true);
    const action = editingId ? 'updateVehicle' : 'addVehicle';
    
    // eslint-disable-next-line no-unused-vars
    const { password, ...payloadData } = formData;
    
    const payload = {
      kategori,
      id: editingId, // backend generated for add, but passed just in case GAS needs it
      ...payloadData
    };

    try {
      const resp = await apiCall(action, payload);
      if (resp.success) {
        alert(editingId ? 'Berjaya dikemaskini.' : 'Berjaya ditambah.');
        setIsModalOpen(false);
        fetchData(); // refresh list
      } else {
        alert(resp.message || 'Ralat menyimpan data.');
      }
    } catch (err) {
      alert('Ralat sistem penyimpanan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Adakah anda pasti untuk padam rekod kenderaan ini?')) return;
    
    // Optimistic UI could be nice, but simple block is safer here
    try {
      const resp = await apiCall('deleteVehicle', { kategori, id });
      if (resp.success) {
         setData(data.filter(d => d.id !== id));
      } else {
         alert(resp.message || 'Ralat semasa memadam rekod.');
      }
    } catch (e) {
      alert('Ralat sistem pemadaman.');
    }
  };

  const filteredData = data.filter(d => 
    (d.nama || '').toLowerCase().includes(search.toLowerCase()) || 
    (d.no_kenderaan || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400">Jumlah rekod: <span className="font-medium text-cyan-400">{data.length}</span></p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Cari nama atau plat..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-slate-200 transition-all"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Kenderaan</span>
            <span className="inline sm:hidden">Tambah</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-800/50 text-slate-400 font-medium text-xs">
               <tr>
                 <th className="px-6 py-4">Nama Pemilik</th>
                 <th className="px-6 py-4">No Plat</th>
                 <th className="px-6 py-4">Butiran (Jenama/Model/Warna)</th>
                 <th className="px-6 py-4 text-center">Status</th>
                 <th className="px-6 py-4">Catatan</th>
                 <th className="px-6 py-4 text-right">Tindakan</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-800/50">
               {loading ? (
                 <tr>
                   <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                     <div className="flex items-center justify-center space-x-2">
                       <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                       <span>Memuatkan rekod...</span>
                     </div>
                   </td>
                 </tr>
               ) : filteredData.length === 0 ? (
                 <tr>
                   <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Tiada data dijumpai.</td>
                 </tr>
               ) : (
                 filteredData.map((row) => (
                   <tr key={row.id} className="hover:bg-white/5 transition-colors text-slate-300">
                     <td className="px-6 py-4 font-medium text-slate-200">{row.nama}</td>
                     <td className="px-6 py-4 font-mono text-cyan-400">
                       {row.no_kenderaan}
                     </td>
                     <td className="px-6 py-4 text-slate-400">
                       {row.jenama} {row.model} {row.warna && `· ${row.warna}`}
                     </td>
                     <td className="px-6 py-4 text-center">
                       <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${
                         row.status === 'AKTIF' 
                         ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                         : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                       }`}>
                         {row.status}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-slate-400 max-w-[150px] truncate" title={row.catatan}>{row.catatan || '-'}</td>
                     <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                         <button 
                           onClick={() => handleOpenModal(row)}
                           className="text-slate-500 hover:text-cyan-400 transition-colors p-1"
                           title="Kemaskini"
                         >
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => handleDelete(row.id)}
                           className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                           title="Padam"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))
               )}
             </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-medium text-lg text-slate-200">
                {editingId ? 'Kemaskini Kenderaan' : 'Daftar Kenderaan Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-rose-400 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="vehicleForm" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 block md:col-span-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Nama Pemilik <span className="text-rose-500">*</span></label>
                  <input required type="text" value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all" placeholder="Contoh: Ahmad bin Abu" />
                  <p className="text-xs text-slate-500 mt-1">Isi nama penuh pemilik kenderaan.</p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">No. Kad Pengenalan <span className="text-rose-500">*</span></label>
                  <input required type="text" value={formData.no_ic} onChange={(e) => setFormData({...formData, no_ic: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all" placeholder="Contoh: 900101-01-1234" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">No Kenderaan / Plat <span className="text-rose-500">*</span></label>
                  <input required type="text" value={formData.no_kenderaan} onChange={(e) => setFormData({...formData, no_kenderaan: e.target.value.toUpperCase()})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all uppercase" placeholder="ABC 1234" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Jenama <span className="text-rose-500">*</span></label>
                  <input required type="text" value={formData.jenama} onChange={(e) => setFormData({...formData, jenama: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all" placeholder="Contoh: Proton" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Model</label>
                  <input type="text" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all" placeholder="Contoh: Saga" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Warna</label>
                  <input type="text" value={formData.warna} onChange={(e) => setFormData({...formData, warna: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all" placeholder="Contoh: Hitam" />
                </div>
                
                <div className="space-y-1.5 pt-4 block md:col-span-2 border-t border-slate-800 mt-2">
                  <p className="text-xs text-rose-400 mb-3 font-medium">✨ Pengesahan Keselamatan</p>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Kata Laluan Sistem <span className="text-rose-500">*</span></label>
                  <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all" placeholder="Masukkan kata laluan yang dibenarkan" />
                </div>
                

              </form>
            </div>
            
            <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                disabled={saving}
                className="px-5 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 border border-transparent hover:border-slate-700"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="vehicleForm"
                disabled={saving}
                className="px-5 py-2 text-sm font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving && <div className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>}
                {saving ? 'Menyimpan...' : 'Simpan Rekod'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
