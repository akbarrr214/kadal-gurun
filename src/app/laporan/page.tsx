'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Download, Filter, Loader2, Calendar } from 'lucide-react';
import DataTable, { Column } from '@/components/DataTable';
import StatusIndicator from '@/components/StatusIndicator';
import { Indikator } from '@/types';

export default function LaporanPage() {
  const supabase = createClient();
  const [kategori, setKategori] = useState<string>('balita');
  const [bulan, setBulan] = useState(new Date().getMonth() + 1); // 1-12
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [kategori, bulan, tahun]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
      // Calculate end date (last day of the month)
      const lastDay = new Date(tahun, bulan, 0).getDate();
      const endDate = `${tahun}-${String(bulan).padStart(2, '0')}-${lastDay}`;

      let tableName = '';
      if (kategori === 'balita') tableName = 'pengukuran_balita';
      else if (kategori === 'lansia') tableName = 'pengukuran_lansia';
      else if (kategori === 'ibu_hamil' || kategori === 'ibu-hamil') tableName = 'pengukuran_ibu_hamil';

      const { data: result, error } = await supabase
        .from(tableName)
        .select(`
          *,
          warga:warga_id (
            nama,
            nik,
            tanggal_lahir,
            jenis_kelamin
          )
        `)
        .gte('tanggal_pengukuran', startDate)
        .lte('tanggal_pengukuran', endDate)
        .order('tanggal_pengukuran', { ascending: false });

      if (error) throw error;
      setData(result || []);
    } catch (err) {
      console.error('Error fetching laporan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    setExporting(true);
    try {
      if (!data || data.length === 0) {
        alert('Tidak ada data untuk diexport');
        return;
      }

      // Flatten data for CSV
      const flatData = data.map(item => {
        const { warga, ...measurement } = item;
        return {
          nama: warga?.nama || 'Unknown',
          nik: warga?.nik ? `'${warga.nik}` : '-', // Add quote to prevent scientific notation in Excel
          tanggal_pengukuran: measurement.tanggal_pengukuran,
          ...measurement,
          // Remove bulky objects if any
          warga_id: undefined,
          id: undefined,
          created_at: undefined,
          indikasi_penyakit: Array.isArray(measurement.indikasi_penyakit)
            ? measurement.indikasi_penyakit.join('; ')
            : measurement.indikasi_penyakit
        };
      });

      // Generate headers
      const headers = Object.keys(flatData[0]);
      const csvContent = [
        headers.join(','),
        ...flatData.map(row =>
          headers.map(fieldName => {
            const val = row[fieldName];
            return `"${String(val ?? '').replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Laporan_${kategori}_${bulan}-${tahun}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error('Export error:', err);
      alert('Gagal export data');
    } finally {
      setExporting(false);
    }
  };

  // Define columns dynamically based on category
  const getColumns = (): Column<any>[] => {
    const baseColumns: Column<any>[] = [
      {
        header: 'Tanggal',
        accessorKey: 'tanggal_pengukuran',
        cell: (row) => new Date(row.tanggal_pengukuran).toLocaleDateString('id-ID'),
        className: 'w-32'
      },
      {
        header: 'Nama Warga',
        cell: (row) => (
          <div>
            <div className="font-medium text-gray-900">{row.warga?.nama}</div>
            <div className="text-xs text-gray-500">{row.warga?.nik}</div>
          </div>
        )
      },
    ];

    if (kategori === 'balita') {
      return [
        ...baseColumns,
        { header: 'BB (kg)', accessorKey: 'berat_badan', className: 'w-24' },
        { header: 'TB (cm)', accessorKey: 'tinggi_badan', className: 'w-24' },
        { header: 'LILA (cm)', accessorKey: 'lingkar_lengan', className: 'w-24' },
        {
          header: 'Status Gizi',
          accessorKey: 'status_gizi',
          cell: (row) => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status_gizi === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
              {row.status_gizi}
            </span>
          )
        },
        {
          header: 'Indikator',
          accessorKey: 'indikator',
          cell: (row) => <StatusIndicator status={row.indikator as Indikator} size="sm" />
        },
        {
          header: 'Rekomendasi',
          accessorKey: 'rekomendasi',
          cell: (row) => <span className="text-xs text-gray-600 truncate max-w-xs block" title={row.rekomendasi}>{row.rekomendasi}</span>
        }
      ];
    }

    if (kategori === 'lansia') {
      return [
        ...baseColumns,
        { header: 'BB (kg)', accessorKey: 'berat_badan' },
        { header: 'Tensi', cell: (row) => `${row.tekanan_darah_sistolik || '-'}/${row.tekanan_darah_diastolik || '-'}` },
        { header: 'Gula (mg/dL)', accessorKey: 'gula_darah' },
        { header: 'Kolesterol', accessorKey: 'kolesterol' },
        {
          header: 'Indikator',
          accessorKey: 'indikator',
          cell: (row) => <StatusIndicator status={row.indikator as Indikator} size="sm" />
        },
        {
          header: 'Rekomendasi',
          accessorKey: 'rekomendasi',
          cell: (row) => <span className="text-xs text-gray-600 truncate max-w-xs block" title={row.rekomendasi}>{row.rekomendasi}</span>
        }
      ];
    }

    if (kategori === 'ibu-hamil') {
      return [
        ...baseColumns,
        { header: 'Usia Hamil (mgg)', accessorKey: 'usia_kehamilan' },
        { header: 'BB (kg)', accessorKey: 'berat_badan' },
        { header: 'Tensi', cell: (row) => `${row.tekanan_darah_sistolik || '-'}/${row.tekanan_darah_diastolik || '-'}` },
        { header: 'Hb', accessorKey: 'hb' },
        {
          header: 'Indikator',
          accessorKey: 'indikator',
          cell: (row) => <StatusIndicator status={row.indikator as Indikator} size="sm" />
        },
        {
          header: 'Rekomendasi',
          accessorKey: 'rekomendasi',
          cell: (row) => <span className="text-xs text-gray-600 truncate max-w-xs block" title={row.rekomendasi}>{row.rekomendasi}</span>
        }
      ];
    }

    return baseColumns;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Laporan Bulanan</h1>
          <p className="text-gray-500 mt-1">Rekap hasil pengukuran kesehatan warga</p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={exporting || loading || data.length === 0}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {exporting ? <Loader2 className="animate-spin w-4 h-4" /> : <Download className="w-4 h-4" />}
          Export Excel (.csv)
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Data</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="balita">Balita</option>
                <option value="lansia">Lansia</option>
                <option value="ibu-hamil">Ibu Hamil</option>
              </select>
            </div>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={bulan}
                onChange={(e) => setBulan(parseInt(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(0, m - 1).toLocaleString('id-ID', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
            <select
              value={tahun}
              onChange={(e) => setTahun(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">
            Hasil Pengukuran {kategori.charAt(0).toUpperCase() + kategori.slice(1).replace('-', ' ')}
          </h3>
          <span className="text-sm text-gray-500">
            Total: {data.length} wara
          </span>
        </div>
        <DataTable
          data={data}
          columns={getColumns()}
          isLoading={loading}
          emptyMessage={`Tidak ada data pengukuran untuk periode ${new Date(0, bulan - 1).toLocaleString('id-ID', { month: 'long' })} ${tahun}`}
        />
      </div>
    </div>
  );
}
