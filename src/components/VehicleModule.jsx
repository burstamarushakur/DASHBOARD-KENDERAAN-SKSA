import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Car } from 'lucide-react';
import { apiCall } from '../lib/api';

const EMPTY_MASTER_DATA = {
  staf: [],
  kenderaan: [],
  jenamaList: [],
  modelByJenama: {}
};

function normalizeMasterData(input) {
  const data = input && typeof input === 'object' ? input : {};

  return {
    staf: Array.isArray(data.staf) ? data.staf : [],
    kenderaan: Array.isArray(data.kenderaan) ? data.kenderaan : [],
    jenamaList: Array.isArray(data.jenamaList) ? data.jenamaList : [],
    modelByJenama:
      data.modelByJenama && typeof data.modelByJenama === 'object'
        ? data.modelByJenama
        : {}
  };
}

function toUpper(value) {
  return String(value || '').toUpperCase();
}

function groupVehiclesByOwner(rows, kategori) {
  const grouped = {};

  rows.forEach((row) => {
    const ownerName = row.nama || 'TANPA NAMA';
    const ppkiInfo = kategori === 'PPKI'
      ? `|${row.nama_murid || ''}|${row.kelas_murid || ''}`
      : '';

    const key = `${ownerName}${ppkiInfo}`;

    if (!grouped[key]) {
      grouped[key] = {
        key,
        nama: ownerName,
        nama_murid: row.nama_murid || '',
        kelas_murid: row.kelas_murid || '',
        vehicles: []
      };
    }

    grouped[key].vehicles.push(row);
  });

  return Object.values(grouped).sort((a, b) => {
    return String(a.nama || '').localeCompare(String(b.nama || ''));
  });
}

export default function VehicleModule({ title, kategori }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [masterData, setMasterData] = useState(EMPTY_MASTER_DATA);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [showStaffDropdown, setShowStaffDropdown] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isCustomJenama, setIsCustomJenama] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);

  const [formData, setFormData] = useState({
    no_ic: '',
    password: '',
    nama: '',
    nama_murid: '',
    kelas_murid: '',
    no_kenderaan: '',
    jenama: '',
    model: '',
    warna: '',
    status: 'AKTIF',
    catatan: ''
  });

  const [saving, setSaving] = useState(false);

  const safeMasterData = normalizeMasterData(masterData);
  const useStaffDropdown = kategori === 'GURU' || kategori === 'AKP';
  const isPpki = kategori === 'PPKI';

  const ownerLabel = isPpki
    ? 'Nama Ibubapa/Penjaga'
    : kategori === 'SOKONGAN'
      ? 'Nama Staf Sokongan'
      : 'Nama Pemilik';

  const fetchMasterData = async () => {
    setLoadingMaster(true);

    try {
      const resp = await apiCall('getMasterData', { kategori });

      if (resp && resp.success && resp.data) {
        setMasterData(normalizeMasterData(resp.data));
      } else {
        setMasterData(EMPTY_MASTER_DATA);
      }
    } catch (err) {
      console.error('Error fetching master data:', err);
      setMasterData(EMPTY_MASTER_DATA);
    } finally {
      setLoadingMaster(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const resp = await apiCall('listVehicles', { kategori });

      if (resp && resp.success) {
        setData(Array.isArray(resp.data) ? resp.data : []);
      } else {
        alert((resp && resp.message) || `Ralat memuat turun senarai ${kategori}`);
        setData([]);
      }
    } catch (err) {
      alert('Ralat sistem.');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchMasterData();
  }, [kategori]);

  const resetForm = () => {
    setEditingId(null);
    setIsCustomJenama(false);
    setIsCustomModel(false);
    setShowStaffDropdown(false);

    setFormData({
      no_ic: '',
      password: '',
      nama: '',
      nama_murid: '',
      kelas_murid: '',
      no_kenderaan: '',
      jenama: '',
      model: '',
      warna: '',
      status: 'AKTIF',
      catatan: ''
    });
  };

  const handleOpenModal = (row = null) => {
    if (row) {
      const rowJenama = row.jenama || '';
      const rowModel = row.model || '';

      const isInJenamaList = !!rowJenama && safeMasterData.jenamaList.includes(rowJenama);
      const modelList = safeMasterData.modelByJenama[rowJenama] || [];
      const isInModelList = !!rowModel && modelList.includes(rowModel);

      setEditingId(row.id);
      setIsCustomJenama(!!rowJenama && !isInJenamaList);
      setIsCustomModel(!!rowModel && !isInModelList);

      setFormData({
        no_ic: row.no_ic || '',
        password: '',
        nama: row.nama || '',
        nama_murid: row.nama_murid || '',
        kelas_murid: row.kelas_murid || '',
        no_kenderaan: row.no_kenderaan || '',
        jenama: rowJenama,
        model: rowModel,
        warna: row.warna || '',
        status: row.status || 'AKTIF',
        catatan: row.catatan || ''
      });
    } else {
      resetForm();
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowStaffDropdown(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (formData.password !== 'sksajba5095') {
      alert('Kata laluan tidak tepat. Sila cuba lagi.');
      return;
    }

    if (!formData.nama.trim()) {
      alert(`Sila isi ${ownerLabel}.`);
      return;
    }

    if (isPpki && !formData.nama_murid.trim()) {
      alert('Sila isi nama murid PPKI.');
      return;
    }

    if (isPpki && !formData.kelas_murid.trim()) {
      alert('Sila isi kelas murid PPKI.');
      return;
    }

    if (!formData.no_kenderaan.trim()) {
      alert('Sila isi nombor kenderaan.');
      return;
    }

    if (!formData.jenama.trim()) {
      alert('Sila pilih atau isi jenama kenderaan.');
      return;
    }

    if (!formData.model.trim()) {
      alert('Sila pilih atau isi model kenderaan.');
      return;
    }

    setSaving(true);

    const action = editingId ? 'updateVehicle' : 'addVehicle';
    const { password, ...payloadData } = formData;

    const payload = {
      kategori,
      id: editingId,
      ...payloadData,
      nama: toUpper(payloadData.nama).trim(),
      nama_murid: toUpper(payloadData.nama_murid).trim(),
      kelas_murid: toUpper(payloadData.kelas_murid).trim(),
      no_kenderaan: toUpper(payloadData.no_kenderaan).trim(),
      jenama: toUpper(payloadData.jenama).trim(),
      model: toUpper(payloadData.model).trim(),
      warna: toUpper(payloadData.warna).trim(),
      status: toUpper(payloadData.status).trim(),
      catatan: toUpper(payloadData.catatan).trim()
    };

    try {
      const resp = await apiCall(action, payload);

      if (resp && resp.success) {
        alert(editingId ? 'Berjaya dikemaskini.' : 'Berjaya ditambah.');
        setIsModalOpen(false);
        fetchData();
      } else {
        alert((resp && resp.message) || 'Ralat menyimpan data.');
      }
    } catch (err) {
      alert('Ralat sistem penyimpanan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Adakah anda pasti untuk padam rekod kenderaan ini?')) return;

    try {
      const resp = await apiCall('deleteVehicle', { kategori, id });

      if (resp && resp.success) {
        setData(data.filter(d => d.id !== id));
      } else {
        alert((resp && resp.message) || 'Ralat semasa memadam rekod.');
      }
    } catch (e) {
      alert('Ralat sistem pemadaman.');
    }
  };

  const filteredStaff = safeMasterData.staf
    .filter(s => String(s.kategori || '').toUpperCase() === kategori)
    .filter(s => String(s.nama || '').toLowerCase().includes(String(formData.nama || '').toLowerCase()));

  const modelOptions = safeMasterData.modelByJenama[formData.jenama] || [];

  const filteredData = data.filter(d => {
    const q = search.toLowerCase();

    return (
      (d.nama || '').toLowerCase().includes(q) ||
      (d.nama_murid || '').toLowerCase().includes(q) ||
      (d.kelas_murid || '').toLowerCase().includes(q) ||
      (d.no_kenderaan || '').toLowerCase().includes(q) ||
      (d.jenama || '').toLowerCase().includes(q) ||
      (d.model || '').toLowerCase().includes(q)
    );
  });

  const groupedData = groupVehiclesByOwner(filteredData, kategori);

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400">
            Jumlah kenderaan: <span className="font-medium text-cyan-400">{data.length}</span>
            <span className="mx-2 text-slate-600">|</span>
            Jumlah pemilik: <span className="font-medium text-cyan-400">{groupVehiclesByOwner(data, kategori).length}</span>
          </p>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama, murid atau plat..."
              value={search}
              onChange={(e) => setSearch(toUpper(e.target.value))}
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

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 text-slate-400 font-medium text-xs">
              <tr>
                <th className="px-6 py-4 w-[28%]">Nama Pemilik</th>
                {isPpki && <th className="px-6 py-4 w-[22%]">Maklumat Murid PPKI</th>}
                <th className="px-6 py-4">Kenderaan Berdaftar</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={isPpki ? 3 : 2} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuatkan rekod...</span>
                    </div>
                  </td>
                </tr>
              ) : groupedData.length === 0 ? (
                <tr>
                  <td colSpan={isPpki ? 3 : 2} className="px-6 py-8 text-center text-slate-500">
                    Tiada data dijumpai.
                  </td>
                </tr>
              ) : (
                groupedData.map((group) => (
                  <tr key={group.key} className="hover:bg-white/5 transition-colors text-slate-300 align-top">
                    <td className="px-6 py-5">
                      <div className="font-semibold text-slate-100 leading-snug">
                        {group.nama}
                      </div>
                      <div className="text-[10px] text-cyan-400 mt-2">
                        {group.vehicles.length} kenderaan berdaftar
                      </div>
                    </td>

                    {isPpki && (
                      <td className="px-6 py-5">
                        <div className="font-medium text-slate-200">{group.nama_murid || '-'}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Kelas: <span className="text-slate-400">{group.kelas_murid || '-'}</span>
                        </div>
                      </td>
                    )}

                    <td className="px-6 py-4">
                      <div className="space-y-3">
                        {group.vehicles.map((row) => (
                          <div
                            key={row.id}
                            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-cyan-400 font-bold">
                                  {row.no_kenderaan}
                                </span>
                                <span className="text-slate-600">|</span>
                                <span className="text-slate-300">
                                  {row.jenama} {row.model}
                                </span>
                                {row.warna && (
                                  <>
                                    <span className="text-slate-600">|</span>
                                    <span className="text-slate-400">{row.warna}</span>
                                  </>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${
                                  row.status === 'AKTIF'
                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                }`}>
                                  {row.status}
                                </span>

                                {row.catatan && (
                                  <span className="text-xs text-slate-500 italic">
                                    Catatan: {row.catatan}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 shrink-0">
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
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-medium text-lg text-slate-200">
                {editingId ? 'Kemaskini Kenderaan' : 'Daftar Kenderaan Baru'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-500 hover:text-rose-400 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="vehicleForm" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="space-y-1.5 block md:col-span-2 relative">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    {ownerLabel} <span className="text-rose-500">*</span>
                  </label>

                  {useStaffDropdown ? (
                    <>
                      <input
                        required
                        type="text"
                        value={formData.nama}
                        onChange={(e) => {
                          setFormData({ ...formData, nama: toUpper(e.target.value) });
                          setShowStaffDropdown(true);
                        }}
                        onFocus={() => setShowStaffDropdown(true)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all shadow-inner"
                        placeholder={loadingMaster ? 'MEMUATKAN SENARAI STAF...' : 'CARI NAMA STAF...'}
                      />

                      {showStaffDropdown && (
                        <div className="absolute z-[60] w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-48 overflow-auto">
                          {filteredStaff.length > 0 ? (
                            filteredStaff.map(staff => (
                              <button
                                key={staff.id_staf || staff.nama}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    nama: staff.nama,
                                    no_ic: staff.no_ic || ''
                                  });
                                  setShowStaffDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 border-b border-white/5 last:border-0 transition-colors"
                              >
                                <div className="font-medium">{staff.nama}</div>
                                {staff.no_ic && <div className="text-[10px] text-slate-500">IC: {staff.no_ic}</div>}
                              </button>
                            ))
                          ) : (
                            <div className="p-3 text-xs text-slate-500 text-center italic">
                              Tiada staf dijumpai.
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => setShowStaffDropdown(false)}
                            className="w-full text-center py-2 text-[10px] bg-slate-800 text-slate-400 hover:text-slate-200"
                          >
                            Tutup
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <input
                      required
                      type="text"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: toUpper(e.target.value) })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all shadow-inner"
                      placeholder={isPpki ? 'CONTOH: NAMA BAPA / IBU / PENJAGA' : 'CONTOH: NAMA STAF SOKONGAN'}
                    />
                  )}

                  {formData.no_ic && (
                    <div className="flex items-center gap-2 mt-1 px-2 py-1 bg-slate-800/50 rounded inline-flex">
                      <span className="text-[10px] text-slate-500 font-mono">IC: {formData.no_ic}</span>
                    </div>
                  )}
                </div>

                {isPpki && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Nama Murid PPKI <span className="text-rose-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.nama_murid}
                        onChange={(e) => setFormData({ ...formData, nama_murid: toUpper(e.target.value) })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all"
                        placeholder="CONTOH: NAMA MURID"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Kelas Murid PPKI <span className="text-rose-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.kelas_murid}
                        onChange={(e) => setFormData({ ...formData, kelas_murid: toUpper(e.target.value) })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all"
                        placeholder="CONTOH: PPKI 1"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    No Kenderaan / Plat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.no_kenderaan}
                    onChange={(e) => setFormData({ ...formData, no_kenderaan: toUpper(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all uppercase"
                    placeholder="ABC 1234"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Jenama <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required={!isCustomJenama}
                    value={isCustomJenama ? 'LAIN-LAIN' : formData.jenama}
                    onChange={(e) => {
                      const val = e.target.value;

                      if (val === 'LAIN-LAIN') {
                        setIsCustomJenama(true);
                        setIsCustomModel(true);
                        setFormData({ ...formData, jenama: '', model: '' });
                      } else {
                        setIsCustomJenama(false);
                        setIsCustomModel(false);
                        setFormData({ ...formData, jenama: val, model: '' });
                      }
                    }}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all"
                  >
                    <option value="">-- PILIH JENAMA --</option>
                    {safeMasterData.jenamaList.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                    <option value="LAIN-LAIN">LAIN-LAIN (MANUAL)</option>
                  </select>
                </div>

                {isCustomJenama && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
                      Nyatakan Jenama <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.jenama}
                      onChange={(e) => setFormData({ ...formData, jenama: toUpper(e.target.value) })}
                      className="w-full p-2.5 bg-slate-950 border border-cyan-500/30 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all"
                      placeholder="CONTOH: CHERY"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Model <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required={!isCustomModel}
                    value={isCustomModel ? 'LAIN-LAIN' : formData.model}
                    onChange={(e) => {
                      const val = e.target.value;

                      if (val === 'LAIN-LAIN') {
                        setIsCustomModel(true);
                        setFormData({ ...formData, model: '' });
                      } else {
                        setIsCustomModel(false);
                        setFormData({ ...formData, model: val });
                      }
                    }}
                    disabled={!formData.jenama && !isCustomJenama}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all disabled:opacity-50"
                  >
                    <option value="">-- PILIH MODEL --</option>
                    {modelOptions.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="LAIN-LAIN">LAIN-LAIN (MANUAL)</option>
                  </select>
                </div>

                {(isCustomModel || isCustomJenama) && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
                      Nyatakan Model <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: toUpper(e.target.value) })}
                      className="w-full p-2.5 bg-slate-950 border border-cyan-500/30 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all"
                      placeholder="CONTOH: OMODA 5"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Warna</label>
                  <input
                    type="text"
                    value={formData.warna}
                    onChange={(e) => setFormData({ ...formData, warna: toUpper(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all"
                    placeholder="CONTOH: HITAM"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="TIDAK AKTIF">TIDAK AKTIF</option>
                  </select>
                </div>

                <div className="space-y-1.5 block md:col-span-2">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Catatan</label>
                  <textarea
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: toUpper(e.target.value) })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all resize-none"
                    placeholder="NOTA TAMBAHAN..."
                    rows="2"
                  />
                </div>

                <div className="space-y-1.5 pt-4 block md:col-span-2 border-t border-slate-800 mt-2">
                  <p className="text-xs text-rose-400 mb-3 font-medium">Pengesahan Keselamatan</p>
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Kata Laluan Sistem <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none text-sm transition-all"
                    placeholder="Masukkan kata laluan yang dibenarkan"
                  />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
              <button
                type="button"
                onClick={handleCloseModal}
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