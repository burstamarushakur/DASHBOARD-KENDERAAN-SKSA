import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Dummy fallback data generator
  function getMockData(body) {
    const { action, payload } = body;
    const now = new Date().toISOString();
    
    if (action === 'getDashboardData') {
      return {
        success: true,
        data: { totalGuru: 45, totalAkp: 12, totalSokongan: 8, visitorToday: 5, visitorActive: 2 },
        message: "Berjaya dimuat turun (Fallback Mode)"
      };
    }
    
    if (action === 'listVehicles') {
      const data = payload?.kategori === 'GURU' ? [
        { id: 'g1', timestamp: now, nama: 'Cikgu Ahmad', no_kenderaan: 'JDT 1234', jenama: 'Proton', model: 'Saga', warna: 'Merah', status: 'AKTIF', catatan: '-' },
        { id: 'g2', timestamp: now, nama: 'Ustazah Siti', no_kenderaan: 'WXY 999', jenama: 'Perodua', model: 'Myvi', warna: 'Putih', status: 'AKTIF', catatan: '-' }
      ] : payload?.kategori === 'AKP' ? [
        { id: 'a1', timestamp: now, nama: 'Kerani Abu', no_kenderaan: 'BEE 45', jenama: 'Honda', model: 'City', warna: 'Hitam', status: 'AKTIF', catatan: '-' }
      ] : [
        { id: 's1', timestamp: now, nama: 'Pak Mat Guard', no_kenderaan: 'VAG 1', jenama: 'Toyota', model: 'Vios', warna: 'Silver', status: 'AKTIF', catatan: '-' }
      ];
      return { success: true, data, message: "Berjaya (Fallback Mode)" };
    }

    if (action === 'listVisitors') {
      return {
        success: true,
        data: [
           { id: 'v1', timestamp_masuk: now, tarikh: '2026-05-14', masa_masuk: '08:00 AM', nama_pelawat: 'Ali bin Abu', no_kenderaan: 'ABC 123', tujuan: 'Mesyuarat PIBG', jumpa_siapa: 'Guru Besar', masa_keluar: '', status: 'MASUK', catatan: '' },
           { id: 'v2', timestamp_masuk: now, tarikh: '2026-05-14', masa_masuk: '09:00 AM', nama_pelawat: 'Muthu', no_kenderaan: 'DEF 456', tujuan: 'Hantar Barang', jumpa_siapa: 'Pejabat', masa_keluar: '09:45 AM', status: 'KELUAR', catatan: 'Shopee Express' }
        ],
        message: "Berjaya (Fallback Mode)"
      };
    }

    if (action === 'searchPlate') {
      return {
        success: true,
        data: [
          { id: 'search1', kategori: 'GURU', nama: 'Contoh Pemilik', no_kenderaan: payload?.no_kenderaan || 'JDT 1234', jenama: 'Proton', model: 'Saga', status: 'AKTIF', catatan: 'Demo' }
        ],
        message: "Carian ditemui (Fallback Mode)"
      };
    }

    // Default response for writes
    return { success: true, data: { status: 'mock_success' }, message: "Tindakan berjaya (Fallback Mode)" };
  }

  // Local handler for GAS API proxy
  app.post('/api/gas', async (req, res) => {
    const gasUrl = process.env.GAS_WEB_APP_URL;
    
    if (!gasUrl) {
      console.warn("GAS_WEB_APP_URL is not set. Using fallback dummy data.");
      return res.status(200).json(getMockData(req.body));
    }
    
    try {
      const response = await fetch(gasUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(req.body)
      });
      
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Non-JSON response from GAS:", text);
        return res.status(500).json({ success: false, message: "Response from GAS is not JSON" });
      }
      
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
