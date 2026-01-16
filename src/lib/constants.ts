export const CATEGORIES = [
  { value: 'balita', label: 'Balita (0-5 tahun)' },
  { value: 'lansia', label: 'Lansia (60+ tahun)' },
  { value: 'ibu-hamil', label: 'Ibu Hamil' },
];

export const MEASUREMENT_TYPES = {
  balita: ['Tinggi Badan', 'Berat Badan', 'Lingkar Kepala'],
  lansia: ['Tekanan Darah', 'Berat Badan', 'Tinggi Badan'],
  'ibu-hamil': ['Berat Badan', 'Tekanan Darah', 'Tinggi Fundus'],
} as const;

export const STATUS_COLORS = {
  hijau: 'bg-green-500 text-green-800',
  kuning: 'bg-yellow-500 text-yellow-800',
  merah: 'bg-red-500 text-red-800',
} as const;
