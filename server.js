import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  function getMockMasterData(payload = {}) {
    const kategori = String(payload.kategori || '').toUpperCase();

    const allStaf = [
      { id_staf: 'STF0001', kategori: 'GURU', nama: 'SITI ZALEHA BINTI RAMLAN', no_ic: '', status: 'AKTIF' },
      { id_staf: 'STF0002', kategori: 'GURU', nama: 'KHAIRUL NIZWAN BIN HAMALI', no_ic: '', status: 'AKTIF' },
      { id_staf: 'STF0003', kategori: 'GURU', nama: 'MOHD HASRUL ASRAF BIN OTHMAN', no_ic: '', status: 'AKTIF' },
      { id_staf: 'STF0004', kategori: 'AKP', nama: 'ZAIHANI BINTI MISBAH', no_ic: '', status: 'AKTIF' },
      { id_staf: 'STF0005', kategori: 'AKP', nama: 'NURLEE BINTI ABU BAKAR', no_ic: '', status: 'AKTIF' },
      { id_staf: 'STF0006', kategori: 'SOKONGAN', nama: 'CONTOH STAF SOKONGAN', no_ic: '', status: 'AKTIF' }
    ];

    const staf = kategori
      ? allStaf.filter(item => item.kategori === kategori)
      : allStaf;

    const kenderaan = [
      { jenama: 'PERODUA', model: 'AXIA', status: 'AKTIF' },
      { jenama: 'PERODUA', model: 'MYVI', status: 'AKTIF' },
      { jenama: 'PERODUA', model: 'BEZZA', status: 'AKTIF' },
      { jenama: 'PROTON', model: 'SAGA', status: 'AKTIF' },
      { jenama: 'PROTON', model: 'PERSONA', status: 'AKTIF' },
      { jenama: 'HONDA', model: 'CITY', status: 'AKTIF' },
      { jenama: 'TOYOTA', model: 'VIOS', status: 'AKTIF' },
      { jenama: 'LAIN-LAIN', model: 'LAIN-LAIN', status: 'AKTIF' }
    ];

    const jenamaList = [...new Set(kenderaan.map(item => item.jenama))].sort();

    const modelByJenama = {};
    kenderaan.forEach(item => {
      if (!modelByJenama[item.jenama]) {
        modelByJenama[item.jenama] = [];
      }
      if (!modelByJenama[item.jenama].includes(item.model)) {
        modelByJenama[item.jenama].push(item.model);
      }
    });

    Object.keys(modelByJenama).forEach(jenama => {
      modelByJenama[jenama].sort();
    });

    return {
      success: true,
      data: {
        staf,
        kenderaan,
        jenamaList,
        modelByJenama
      },
      message: 'Berjaya dimuat turun (Fallback Master Data)'
    };
  }

  function getMockData(body) {
    const { action, payload = {} } = body || {};
    const now = new Date().toISOString();

    if (action === 'getDashboardData') {
      return {
        success: true,
        data: {
          totalGuru: 45,
          totalAkp: 12,
          totalSokongan: 8,
          visitorToday: 5,
          visitorActive: 2
        },
        message: 'Berjaya dimuat turun (Fallback Mode)'
      };
    }

    if (action === 'getMasterData') {
      return getMockMasterData(payload);
    }

    if (action === 'listVehicles') {
      const data = payload?.kategori === 'GURU'
        ? [
            {
              id: 'g1',
              timestamp: now,
              no_ic: '',
              nama: 'KHAIRUL NIZWAN BIN HAMALI',
              no_kenderaan: 'JXM5348',
              jenama: 'PERODUA',
              model: 'AXIA',
              warna: 'BIRU',
              status: 'AKTIF',
              catatan: '-'
            },
            {
              id: 'g2',
              timestamp: now,
              no_ic: '',
              nama: 'MOHD HASRUL ASRAF BIN OTHMAN',
              no_kenderaan: 'JDT1234',
              jenama: 'PERODUA',
              model: 'MYVI',
              warna: 'PUTIH',
              status: 'AKTIF',
              catatan: '-'
            }
          ]
        : payload?.kategori === 'AKP'
          ? [
              {
                id: 'a1',
                timestamp: now,
                no_ic: '',
                nama: 'ZAIHANI BINTI MISBAH',
                no_kenderaan: 'BEE45',
                jenama: 'HONDA',
                model: 'CITY',
                warna: 'HITAM',
                status: 'AKTIF',
                catatan: '-'
              }
            ]
          : [
              {
                id: 's1',
                timestamp: now,
                no_ic: '',
                nama: 'CONTOH STAF SOKONGAN',
                no_kenderaan: 'VAG1',
                jenama: 'TOYOTA',
                model: 'VIOS',
                warna: 'SILVER',
                status: 'AKTIF',
                catatan: '-'
              }
            ];

      return {
        success: true,
        data,
        message: 'Berjaya (Fallback Mode)'
      };
    }

    if (action === 'listVisitors') {
      return {
        success: true,
        data: [
          {
            id: 'v1',
            timestamp_masuk: now,
            tarikh: '2026-05-14',
            masa_masuk: '08:00 AM',
            nama_pelawat: 'ALI BIN ABU',
            no_kenderaan: 'ABC123',
            tujuan: 'MESYUARAT PIBG',
            jumpa_siapa: 'GURU BESAR',
            masa_keluar: '',
            status: 'MASUK',
            catatan: ''
          },
          {
            id: 'v2',
            timestamp_masuk: now,
            tarikh: '2026-05-14',
            masa_masuk: '09:00 AM',
            nama_pelawat: 'MUTHU',
            no_kenderaan: 'DEF456',
            tujuan: 'HANTAR BARANG',
            jumpa_siapa: 'PEJABAT',
            masa_keluar: '09:45 AM',
            status: 'KELUAR',
            catatan: 'SHOPEE EXPRESS'
          }
        ],
        message: 'Berjaya (Fallback Mode)'
      };
    }

    if (action === 'searchPlate') {
      return {
        success: true,
        data: [
          {
            id: 'search1',
            kategori: 'GURU',
            nama: 'CONTOH PEMILIK',
            no_kenderaan: payload?.no_kenderaan || 'JDT1234',
            jenama: 'PROTON',
            model: 'SAGA',
            warna: 'MERAH',
            status: 'AKTIF',
            catatan: 'DEMO'
          }
        ],
        message: 'Carian ditemui (Fallback Mode)'
      };
    }

    if (action === 'addVehicle' || action === 'updateVehicle' || action === 'deleteVehicle') {
      return {
        success: true,
        data: { status: 'mock_success' },
        message: 'Tindakan berjaya (Fallback Mode)'
      };
    }

    return {
      success: false,
      data: null,
      message: `Action tidak disokong dalam fallback mode: ${action}`
    };
  }

  app.post('/api/gas', async (req, res) => {
    const gasUrl = process.env.GAS_WEB_APP_URL;

    if (!gasUrl) {
      console.warn('GAS_WEB_APP_URL is not set. Using fallback dummy data.');
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
        console.error('Non-JSON response from GAS:', text);
        return res.status(500).json({
          success: false,
          message: 'Response from GAS is not JSON'
        });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();