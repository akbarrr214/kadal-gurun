'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { hitungUmur } from '@/lib/calculations';
import { Plus, Trash2, Activity, Eye, Users } from 'lucide-react';
import { Warga, PengukuranLansia } from '@/types';
import FormWarga from '@/components/FormWarga';
import FormPengukuran from '@/components/FormPengukuran';
import StatusIndicator from '@/components/StatusIndicator';

export default function LansiaPage() {
  const [wargaList, setWargaList] = useState<Warga[]>([]);
  const [pengukuranList, setPengukuranList] = useState<PengukuranLansia[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showFormWarga, setShowFormWarga] = useState(false);
  const [showFormPengukuran, setShowFormPengukuran] = useState(false);
  const [selectedWarga, setSelectedWarga] = useState<Warga | null>(null);
  const [showDetail, setShowDetail] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: wargaData, error: errWarga } = await supabase
        .from('warga')
        .select('*')
        .eq('kategori', 'lansia')
        .order('nama');

      if (errWarga) throw errWarga;

      const { data: pengukuranData, error: errUkur } = await supabase
        .from('pengukuran_lansia')
        .select('*')
        .order('tanggal_pengukuran', { ascending: false });

      if (errUkur) throw errUkur;

      setWargaList(wargaData || []);
      setPengukuranList(pengukuranData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWarga = async (id: string) => {
    if (!confirm('Hapus data lansia ini? Data pengukuran terkait juga akan terhapus.')) return;
    try {
      const { error } = await supabase.from('warga').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Gagal menghapus data');
    }
  };

  const getLatestPengukuran = (wargaId: string) => {
    return pengukuranList.find(p => p.warga_id === wargaId);
  };

  const handleSuccessWarga = () => {
    setShowFormWarga(false);
    fetchData();
  };

  const handleSuccessPengukuran = () => {
    setShowFormPengukuran(false);
    setSelectedWarga(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Users className="w-8 h-8 text-green-600" />
            Data Lansia
          </h1>
          <p className="text-gray-600">Total: <strong>{wargaList.length}</strong> lansia terdaftar</p>
        </div>
        <button
          onClick={() => setShowFormWarga(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Tambah Lansia
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wargaList.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">Belum ada data lansia</p>
          </div>
        ) : (
          wargaList.map((warga) => {
            const latestPengukuran = getLatestPengukuran(warga.id);
            const umur = hitungUmur(warga.tanggal_lahir);

            return (
              <div key={warga.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all overflow-hidden group">
                <div className="p-5 border-b border-gray-50 bg-gradient-to-r from-green-50 to-white">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800 group-hover:text-green-600 transition-colors">
                      {warga.nama}
                    </h3>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                      {umur} tahun
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">NIK: {warga.nik}</p>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Jenis Kelamin</p>
                      <p className="font-medium text-gray-700">{warga.jenis_kelamin || '-'}</p>
                    </div>
                  </div>

                  {latestPengukuran ? (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">
                          {new Date(latestPengukuran.tanggal_pengukuran).toLocaleDateString('id-ID')}
                        </span>
                        <StatusIndicator status={latestPengukuran.indikator} size="sm" />
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-gray-500">Diagnosa</p>
                          <p className="font-semibold text-gray-800 truncate max-w-[120px]" title={latestPengukuran.indikasi_penyakit?.join(', ')}>
                            {latestPengukuran.indikasi_penyakit && latestPengukuran.indikasi_penyakit.length > 0
                              ? latestPengukuran.indikasi_penyakit[0]
                              : 'Sehat'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Tensi</p>
                          <p className="font-semibold text-gray-800">{latestPengukuran.tekanan_darah_sistolik}/{latestPengukuran.tekanan_darah_diastolik}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-orange-50 text-orange-600 text-sm p-3 rounded-lg flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Belum ada pengukuran
                    </div>
                  )}

                  {showDetail === warga.id && latestPengukuran && (
                    <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-y-3 gap-x-2 text-sm animate-in fade-in slide-in-from-top-1">
                      <div><p className="text-xs text-gray-500">Gula Darah</p><p className="font-medium">{latestPengukuran.gula_darah || '-'} mg/dL</p></div>
                      <div><p className="text-xs text-gray-500">Kolesterol</p><p className="font-medium">{latestPengukuran.kolesterol || '-'} mg/dL</p></div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Rekomendasi</p>
                        <p className="text-xs text-gray-700 mt-0.5">{latestPengukuran.rekomendasi || '-'}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-5 py-4 bg-gray-50 flex gap-2 border-t border-gray-100">
                  <button
                    onClick={() => setShowDetail(showDetail === warga.id ? null : warga.id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm transition-colors ${showDetail === warga.id ? 'bg-gray-200 text-gray-800' : 'text-gray-600 hover:bg-gray-200'}`}
                    disabled={!latestPengukuran}
                  >
                    <Eye size={16} /> {showDetail === warga.id ? 'Tutup' : 'Detail'}
                  </button>
                  <button
                    onClick={() => { setSelectedWarga(warga); setShowFormPengukuran(true) }}
                    className="flex-1 flex items-center justify-center gap-1 text-white bg-green-600 hover:bg-green-700 py-2 rounded-lg text-sm shadow-sm transition-all"
                  >
                    <Activity size={16} /> Ukur
                  </button>
                  <button
                    onClick={() => handleDeleteWarga(warga.id)}
                    className="w-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
                    title="Hapus Data"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Form Warga */}
      {showFormWarga && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
              <h3 className="font-bold text-lg">Tambah Data Lansia</h3>
              <button onClick={() => setShowFormWarga(false)} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
            </div>
            <FormWarga onSuccess={handleSuccessWarga} onCancel={() => setShowFormWarga(false)} />
          </div>
        </div>
      )}

      {/* Modal Form Pengukuran */}
      {showFormPengukuran && selectedWarga && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <FormPengukuran
              warga={selectedWarga}
              onSuccess={handleSuccessPengukuran}
              onCancel={() => { setShowFormPengukuran(false); setSelectedWarga(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
