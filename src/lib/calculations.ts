// src/lib/calculations.ts
import { Indikator } from '@/types';

// Helper function untuk update indikator
function updateIndikator(current: Indikator, newStatus: Indikator): Indikator {
  if (current === 'merah') return 'merah';
  if (newStatus === 'merah') return 'merah';
  if (current === 'kuning' || newStatus === 'kuning') return 'kuning';
  return 'hijau';
}

// Fungsi hitung umur dari tanggal lahir
export function hitungUmur(tanggalLahir: string): number {
  const today = new Date();
  const birthDate = new Date(tanggalLahir);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

// Fungsi hitung umur dalam bulan (untuk balita)
export function hitungUmurBulan(tanggalLahir: string): number {
  const today = new Date();
  const birthDate = new Date(tanggalLahir);

  const yearDiff = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  let months = yearDiff * 12 + monthDiff;
  if (dayDiff < 0) {
    months -= 1;
  }
  return Math.max(0, months);
}

// Hitung BMI (Body Mass Index)
export function hitungBMI(beratBadan: number, tinggiBadan: number): number {
  if (tinggiBadan <= 0) return 0;
  const tinggiMeter = tinggiBadan / 100;
  return beratBadan / (tinggiMeter * tinggiMeter);
}

// ========== DATA STANDAR WHO (Interpolasi) ==========

type StandardData = {
  x: number; // Age (month) or Height (cm)
  sd3n: number; sd2n: number; sd2p: number; sd3p: number;
};

// 1. BB/U (Weight-for-Age) Boys 0-60mo
const WFA_BOYS: StandardData[] = [
  { x: 0, sd3n: 2.1, sd2n: 2.5, sd2p: 4.4, sd3p: 5.0 },
  { x: 6, sd3n: 5.7, sd2n: 6.4, sd2p: 9.8, sd3p: 10.9 },
  { x: 12, sd3n: 7.4, sd2n: 8.6, sd2p: 11.8, sd3p: 12.9 },
  { x: 24, sd3n: 9.7, sd2n: 10.6, sd2p: 14.8, sd3p: 16.2 }, // Corrected WHO
  { x: 36, sd3n: 11.3, sd2n: 12.7, sd2p: 17.4, sd3p: 19.3 }, // Recalibrated for Indo context roughly
  { x: 48, sd3n: 12.7, sd2n: 14.3, sd2p: 20.1, sd3p: 22.6 },
  { x: 60, sd3n: 14.1, sd2n: 16.1, sd2p: 22.7, sd3p: 25.8 }
];

// BB/U Girls
const WFA_GIRLS: StandardData[] = [
  { x: 0, sd3n: 2.0, sd2n: 2.4, sd2p: 4.2, sd3p: 4.8 },
  { x: 6, sd3n: 5.1, sd2n: 5.7, sd2p: 9.3, sd3p: 10.4 },
  { x: 12, sd3n: 6.8, sd2n: 7.9, sd2p: 11.5, sd3p: 12.9 },
  { x: 24, sd3n: 9.0, sd2n: 10.2, sd2p: 13.9, sd3p: 15.5 },
  { x: 36, sd3n: 10.8, sd2n: 12.2, sd2p: 16.9, sd3p: 19.0 },
  { x: 48, sd3n: 12.3, sd2n: 13.9, sd2p: 19.9, sd3p: 22.5 },
  { x: 60, sd3n: 13.7, sd2n: 15.8, sd2p: 22.9, sd3p: 26.2 }
];

// 2. TB/U (Height-for-Age) Boys
const HFA_BOYS: StandardData[] = [
  { x: 0, sd3n: 44.2, sd2n: 46.1, sd2p: 53.7, sd3p: 55.6 },
  { x: 6, sd3n: 61.2, sd2n: 63.3, sd2p: 71.9, sd3p: 74.0 },
  { x: 12, sd3n: 68.6, sd2n: 71.0, sd2p: 80.5, sd3p: 82.9 },
  { x: 24, sd3n: 78.0, sd2n: 81.0, sd2p: 93.2, sd3p: 96.3 },
  { x: 36, sd3n: 85.0, sd2n: 88.7, sd2p: 103.5, sd3p: 107.2 },
  { x: 60, sd3n: 96.1, sd2n: 99.9, sd2p: 119.2, sd3p: 124.0 }
];

// TB/U Girls
const HFA_GIRLS: StandardData[] = [
  { x: 0, sd3n: 43.6, sd2n: 45.4, sd2p: 52.9, sd3p: 54.7 },
  { x: 6, sd3n: 58.9, sd2n: 61.2, sd2p: 70.3, sd3p: 72.5 },
  { x: 12, sd3n: 66.3, sd2n: 68.9, sd2p: 79.2, sd3p: 81.7 },
  { x: 24, sd3n: 76.0, sd2n: 79.3, sd2p: 92.5, sd3p: 95.8 },
  { x: 36, sd3n: 83.6, sd2n: 87.4, sd2p: 102.6, sd3p: 106.4 },
  { x: 60, sd3n: 95.2, sd2n: 98.6, sd2p: 118.7, sd3p: 123.7 }
];

// 3. BB/TB (Weight-for-Height) Boys - Simplified (WHO 45-120cm)
// x is Height/Length in cm
const WFH_BOYS: StandardData[] = [
  { x: 45, sd3n: 1.9, sd2n: 2.0, sd2p: 3.0, sd3p: 3.3 },
  { x: 55, sd3n: 3.4, sd2n: 3.8, sd2p: 5.5, sd3p: 6.1 },
  { x: 65, sd3n: 5.5, sd2n: 6.1, sd2p: 8.6, sd3p: 9.3 },
  { x: 75, sd3n: 7.4, sd2n: 8.1, sd2p: 11.1, sd3p: 11.9 },
  { x: 85, sd3n: 9.1, sd2n: 10.0, sd2p: 13.6, sd3p: 14.6 },
  { x: 95, sd3n: 10.9, sd2n: 12.1, sd2p: 16.8, sd3p: 18.1 },
  { x: 105, sd3n: 12.9, sd2n: 14.4, sd2p: 20.5, sd3p: 22.3 },
  { x: 115, sd3n: 15.3, sd2n: 17.2, sd2p: 24.9, sd3p: 27.3 },
  { x: 120, sd3n: 16.6, sd2n: 18.7, sd2p: 27.4, sd3p: 30.2 }
];

// BB/TB Girls
const WFH_GIRLS: StandardData[] = [
  { x: 45, sd3n: 1.9, sd2n: 2.0, sd2p: 3.0, sd3p: 3.3 },
  { x: 55, sd3n: 3.2, sd2n: 3.6, sd2p: 5.4, sd3p: 6.0 },
  { x: 65, sd3n: 5.2, sd2n: 5.8, sd2p: 8.3, sd3p: 9.0 },
  { x: 75, sd3n: 7.0, sd2n: 7.8, sd2p: 10.8, sd3p: 11.6 },
  { x: 85, sd3n: 8.8, sd2n: 9.8, sd2p: 13.5, sd3p: 14.6 },
  { x: 95, sd3n: 10.6, sd2n: 11.9, sd2p: 16.8, sd3p: 18.4 },
  { x: 105, sd3n: 12.7, sd2n: 14.3, sd2p: 20.8, sd3p: 23.0 },
  { x: 115, sd3n: 15.1, sd2n: 17.2, sd2p: 25.6, sd3p: 28.4 },
  { x: 120, sd3n: 16.4, sd2n: 18.8, sd2p: 28.2, sd3p: 31.5 }
];

function interpolate(value: number, x1: number, y1: number, x2: number, y2: number): number {
  return y1 + ((value - x1) * (y2 - y1)) / (x2 - x1);
}

function getStandarValue(table: StandardData[], input: number, key: keyof StandardData): number {
  if (input < table[0].x) return table[0][key] as number;
  if (input > table[table.length - 1].x) return table[table.length - 1][key] as number;

  for (let i = 0; i < table.length - 1; i++) {
    if (input >= table[i].x && input <= table[i + 1].x) {
      return interpolate(
        input,
        table[i].x,
        table[i][key] as number,
        table[i + 1].x,
        table[i + 1][key] as number
      );
    }
  }
  return 0;
}

// ========== PERHITUNGAN BALITA (Comprehensive) ==========

export interface HasilAnalisisBalita {
  statusGizi: string;
  indikator: Indikator;
  indikasiPenyakit: string[];
  rekomendasi: string;
}

export function analisisBalita(
  beratBadan?: number,
  tinggiBadan?: number,
  lingkarLengan?: number,
  _lingkarKepala?: number,
  umurBulan: number = 0,
  jenisKelamin: string = 'Laki-laki'
): HasilAnalisisBalita {
  const indikasiPenyakit: string[] = [];
  let indikator: Indikator = 'hijau';
  let cat_bb_tb = 'Gizi Baik'; // Berat Badan Menurut Tinggi Badan (Status Gizi)

  const rekomendasi: string[] = [];
  const isMale = jenisKelamin.toLowerCase().includes('laki');

  const Tbl_WFA = isMale ? WFA_BOYS : WFA_GIRLS;
  const Tbl_HFA = isMale ? HFA_BOYS : HFA_GIRLS;
  const Tbl_WFH = isMale ? WFH_BOYS : WFH_GIRLS;

  // 1. Analisis BB/U (Weight-for-Age)
  if (beratBadan && umurBulan <= 60) {
    const sd3n = getStandarValue(Tbl_WFA, umurBulan, 'sd3n');
    const sd2n = getStandarValue(Tbl_WFA, umurBulan, 'sd2n');
    const sd2p = getStandarValue(Tbl_WFA, umurBulan, 'sd2p');

    if (beratBadan < sd3n) {
      indikasiPenyakit.push('BB Sangat Kurang (Severely Underweight)');
      indikator = 'merah';
      indikator = 'merah';
    } else if (beratBadan < sd2n) {
      indikasiPenyakit.push('BB Kurang (Underweight)');
      indikator = updateIndikator(indikator, 'kuning');
      indikator = updateIndikator(indikator, 'kuning');
    } else if (beratBadan > sd2p) {
      // BB Lebih is risky
      indikasiPenyakit.push('Risiko BB Lebih');
      indikator = updateIndikator(indikator, 'kuning');
      indikator = updateIndikator(indikator, 'kuning');
    }
  }

  // 2. Analisis TB/U (Height-for-Age)
  if (tinggiBadan && umurBulan <= 60) {
    const sd3n = getStandarValue(Tbl_HFA, umurBulan, 'sd3n');
    const sd2n = getStandarValue(Tbl_HFA, umurBulan, 'sd2n');

    if (tinggiBadan < sd3n) {
      indikasiPenyakit.push('Sangat Pendek (Severely Stunted)');
      indikator = 'merah';
      indikator = 'merah';
    } else if (tinggiBadan < sd2n) {
      indikasiPenyakit.push('Pendek (Stunted)');
      indikator = updateIndikator(indikator, 'kuning');
      indikator = updateIndikator(indikator, 'kuning');
    }
  }

  // 3. Analisis BB/TB (Weight-for-Length/Height) - The 'Real' Gizi Status
  if (beratBadan && tinggiBadan) {
    const sd3n = getStandarValue(Tbl_WFH, tinggiBadan, 'sd3n');
    const sd2n = getStandarValue(Tbl_WFH, tinggiBadan, 'sd2n');
    const sd2p = getStandarValue(Tbl_WFH, tinggiBadan, 'sd2p');
    const sd3p = getStandarValue(Tbl_WFH, tinggiBadan, 'sd3p');

    if (beratBadan < sd3n) {
      indikasiPenyakit.push('Gizi Buruk (Severely Wasted)');
      indikator = 'merah';
      cat_bb_tb = 'Gizi Buruk';
      rekomendasi.push('URGENT: Rujuk RS/Puskesmas untuk perawatan Gizi Buruk');
    } else if (beratBadan < sd2n) {
      indikasiPenyakit.push('Gizi Kurang (Wasted)');
      indikator = updateIndikator(indikator, 'kuning');
      cat_bb_tb = 'Gizi Kurang';
      rekomendasi.push('Berikan makanan tambahan padat gizi (Protein/Lemak)');
    } else if (beratBadan > sd3p) {
      indikasiPenyakit.push('Obesitas');
      indikator = 'merah';
      cat_bb_tb = 'Obesitas';
      rekomendasi.push('Konsultasi dokter gizi untuk penanganan obesitas');
    } else if (beratBadan > sd2p) {
      indikasiPenyakit.push('Gizi Lebih');
      indikator = updateIndikator(indikator, 'kuning');
      cat_bb_tb = 'Gizi Lebih';
      rekomendasi.push('Evaluasi asupan gula dan aktivitas fisik');
    }
  }

  // 4. LILA
  if (lingkarLengan && umurBulan >= 6 && umurBulan <= 59) {
    if (lingkarLengan < 11.5) {
      indikasiPenyakit.push('Gizi Buruk (LiLa Merah)');
      indikator = 'merah';
    } else if (lingkarLengan < 12.5) {
      indikasiPenyakit.push('Gizi Kurang (LiLa Kuning)');
      indikator = updateIndikator(indikator, 'kuning');
    }
  }

  // Recommendations Logic
  if (indikator === 'merah') {
    rekomendasi.push('Segera periksakan ke tenaga kesehatan profesional');
  } else if (indikator === 'kuning') {
    rekomendasi.push('Pantau pertumbuhan tiap bulan di Posyandu');
  } else {
    rekomendasi.push('Tumbuh kembang anak baik, pertahankan');
  }

  if (rekomendasi.length === 0) rekomendasi.push('Pertahankan pola hidup sehat');

  return {
    statusGizi: cat_bb_tb, // Usually 'Status Gizi' refers to BB/TB (Wasting outcome)
    indikator,
    indikasiPenyakit: Array.from(new Set(indikasiPenyakit)),
    rekomendasi: Array.from(new Set(rekomendasi)).join('. ')
  };
}

// ========== PERHITUNGAN LANSIA ==========

export interface HasilAnalisisLansia {
  indikator: Indikator;
  indikasiPenyakit: string[];
  rekomendasi: string;
}

export function analisisLansia(
  beratBadan?: number,
  tinggiBadan?: number,
  tekananDarahSistolik?: number,
  tekananDarahDiastolik?: number,
  gulaDarah?: number,
  kolesterol?: number
): HasilAnalisisLansia {
  const indikasiPenyakit: string[] = [];
  let indikator: Indikator = 'hijau';
  const rekomendasi: string[] = [];

  // BMI (Kemenkes: <18.5 Kurus, 18.5-25 Normal, >25-27 Gemuk, >27 Obesitas)
  if (beratBadan && tinggiBadan) {
    const bmi = hitungBMI(beratBadan, tinggiBadan);
    if (bmi < 18.5) {
      indikasiPenyakit.push('Kurus (Underweight)');
      indikator = updateIndikator(indikator, 'kuning');
      rekomendasi.push('Perbaiki asupan gizi');
    } else if (bmi > 27) {
      indikasiPenyakit.push('Obesitas');
      indikator = 'merah';
      rekomendasi.push('Diet rendah kalori & olah raga ringan');
    } else if (bmi > 25) {
      indikasiPenyakit.push('Gemuk (Overweight)');
      indikator = updateIndikator(indikator, 'kuning');
    }
  }

  if (tekananDarahSistolik && tekananDarahDiastolik) {
    if (tekananDarahSistolik >= 140 || tekananDarahDiastolik >= 90) {
      indikasiPenyakit.push('Hipertensi');
      indikator = 'merah';
      rekomendasi.push('Kontrol tensi rutin, minum obat teratur');
    } else if (tekananDarahSistolik < 90 || tekananDarahDiastolik < 60) {
      indikasiPenyakit.push('Hipotensi');
      indikator = updateIndikator(indikator, 'kuning');
    }
  }

  if (gulaDarah) {
    if (gulaDarah >= 200) {
      indikasiPenyakit.push('Diabetes');
      indikator = 'merah';
      rekomendasi.push('Rujuk ke dokter');
    } else if (gulaDarah >= 140) {
      indikasiPenyakit.push('Pre-Diabetes'); // 140-199 sewaktu
      indikator = updateIndikator(indikator, 'kuning');
    } else if (gulaDarah < 70) {
      indikasiPenyakit.push('Hipoglikemia');
      indikator = 'merah';
      rekomendasi.push('Segera atasi gula darah rendah');
    }
  }

  if (kolesterol) {
    if (kolesterol >= 240) {
      indikasiPenyakit.push('Kolesterol Tinggi');
      indikator = 'merah';
    } else if (kolesterol >= 200) {
      indikasiPenyakit.push('Kolesterol Batas Tinggi');
      indikator = updateIndikator(indikator, 'kuning');
    }
  }

  if (indikasiPenyakit.length === 0) rekomendasi.push('Sehat');

  return {
    indikator,
    indikasiPenyakit,
    rekomendasi: Array.from(new Set(rekomendasi)).join('. ')
  };
}

// ========== PERHITUNGAN IBU HAMIL ==========

export interface HasilAnalisisIbuHamil {
  indikator: Indikator;
  indikasiPenyakit: string[];
  rekomendasi: string;
}

export function analisisIbuHamil(
  _usiaKehamilan?: number,
  _beratBadan?: number,
  _tinggiBadan?: number,
  lingkarLengan?: number,
  tekananDarahSistolik?: number,
  tekananDarahDiastolik?: number,
  hb?: number
): HasilAnalisisIbuHamil {
  const indikasiPenyakit: string[] = [];
  let indikator: Indikator = 'hijau';
  const rekomendasi: string[] = [];

  if (lingkarLengan) {
    if (lingkarLengan < 23.5) {
      indikasiPenyakit.push('KEK (Risiko KEK)');
      indikator = 'merah' as const;
      rekomendasi.push('Perlu PMT Ibu Hamil secepatnya');
    }
  }

  if (tekananDarahSistolik && tekananDarahDiastolik) {
    if (tekananDarahSistolik >= 140 || tekananDarahDiastolik >= 90) {
      indikasiPenyakit.push('Hipertensi');
      indikator = 'merah';
      rekomendasi.push('Waspada Preeklampsia, rujuk segera');
    } else if (tekananDarahSistolik < 90 || tekananDarahDiastolik < 60) {
      indikasiPenyakit.push('Hipotensi');
      indikator = updateIndikator(indikator, 'kuning');
    }
  }

  if (hb) {
    if (hb < 8) {
      indikasiPenyakit.push('Anemia Berat');
      indikator = 'merah';
      rekomendasi.push('Rujuk RS untuk transfusi/penanganan');
    } else if (hb < 11) {
      indikasiPenyakit.push('Anemia');
      indikator = updateIndikator(indikator, 'kuning');
      rekomendasi.push('Konsumsi tablet tambah darah');
    }
  }

  if (indikasiPenyakit.length === 0) rekomendasi.push('Kehamilan Sehat');

  return {
    indikator,
    indikasiPenyakit,
    rekomendasi: Array.from(new Set(rekomendasi)).join('. ')
  };
}