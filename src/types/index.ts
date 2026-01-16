// src/types/index.ts

export type JenisKelamin = 'Laki-laki' | 'Perempuan';
export type Kategori = 'balita' | 'lansia' | 'ibu_hamil';
export type Indikator = 'hijau' | 'kuning' | 'merah';

export type Warga = {
  id: string;
  nik: string;
  nama: string;
  jenis_kelamin?: string;
  tanggal_lahir: string;
  kategori: 'balita' | 'lansia' | 'ibu_hamil';
  alamat?: string;
  nama_orang_tua?: string;
  created_at?: string;
}

export type PengukuranBalita = {
  id: string;
  warga_id: string;
  tanggal_pengukuran: string;
  berat_badan: number | null;
  tinggi_badan: number | null;
  lingkar_lengan: number | null;
  lingkar_kepala: number | null;
  status_gizi: string;
  indikator: Indikator;
  indikasi_penyakit: string[];
  rekomendasi: string;
  catatan: string | null;
  created_at?: string;
}

export type PengukuranLansia = {
  id: string;
  warga_id: string;
  tanggal_pengukuran: string;
  berat_badan: number | null;
  tinggi_badan: number | null;
  tekanan_darah_sistolik: number | null;
  tekanan_darah_diastolik: number | null;
  gula_darah: number | null;
  kolesterol: number | null;
  indikator: Indikator;
  indikasi_penyakit: string[];
  rekomendasi: string;
  catatan: string | null;
  created_at?: string;
}

export type PengukuranIbuHamil = {
  id: string;
  warga_id: string;
  tanggal_pengukuran: string;
  usia_kehamilan: number | null;
  berat_badan: number | null;
  tinggi_badan: number | null;
  lingkar_lengan: number | null;
  tekanan_darah_sistolik: number | null;
  tekanan_darah_diastolik: number | null;
  hb: number | null;
  indikator: Indikator;
  indikasi_penyakit: string[];
  rekomendasi: string;
  catatan: string | null;
  created_at?: string;
}

export type Pengukuran = {
  id: string;
  warga_id: string;
  tipe: string;
  nilai: number;
  tanggal: string;
  catatan?: string;
  created_at: string;
}

export type Status = 'normal' | 'warning' | 'danger';