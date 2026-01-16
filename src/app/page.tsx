'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Baby, Users, Heart, TrendingUp, Activity } from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalBalita: 0,
    totalLansia: 0,
    totalIbuHamil: 0,
    pengukuranBulanIni: 0,
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      // Count balita
      const { count: balitaCount } = await supabase
        .from('warga')
        .select('*', { count: 'exact', head: true })
        .eq('kategori', 'balita');

      // Count lansia
      const { count: lansiaCount } = await supabase
        .from('warga')
        .select('*', { count: 'exact', head: true })
        .eq('kategori', 'lansia');

      // Count ibu hamil
      const { count: ibuHamilCount } = await supabase
        .from('warga')
        .select('*', { count: 'exact', head: true })
        .eq('kategori', 'ibu_hamil');

      // Count pengukuran bulan ini
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: pengukuranBalita } = await supabase
        .from('pengukuran_balita')
        .select('*', { count: 'exact', head: true })
        .gte('tanggal_pengukuran', startOfMonth.toISOString());

      const { count: pengukuranLansia } = await supabase
        .from('pengukuran_lansia')
        .select('*', { count: 'exact', head: true })
        .gte('tanggal_pengukuran', startOfMonth.toISOString());

      const { count: pengukuranIbuHamil } = await supabase
        .from('pengukuran_ibu_hamil')
        .select('*', { count: 'exact', head: true })
        .gte('tanggal_pengukuran', startOfMonth.toISOString());

      setStats({
        totalBalita: balitaCount || 0,
        totalLansia: lansiaCount || 0,
        totalIbuHamil: ibuHamilCount || 0,
        pengukuranBulanIni: (pengukuranBalita || 0) + (pengukuranLansia || 0) + (pengukuranIbuHamil || 0),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const cards = [
    {
      title: 'Balita',
      value: stats.totalBalita,
      icon: Baby,
      color: 'bg-blue-500',
      link: '/balita',
      description: 'Data balita usia 0-5 tahun'
    },
    {
      title: 'Lansia',
      value: stats.totalLansia,
      icon: Users,
      color: 'bg-green-500',
      link: '/lansia',
      description: 'Data lansia usia 60+ tahun'
    },
    {
      title: 'Ibu Hamil',
      value: stats.totalIbuHamil,
      icon: Heart,
      color: 'bg-pink-500',
      link: '/ibu-hamil',
      description: 'Data ibu hamil'
    },
    {
      title: 'Pengukuran Bulan Ini',
      value: stats.pengukuranBulanIni,
      icon: Activity,
      color: 'bg-purple-500',
      link: '/laporan',
      description: 'Total pemeriksaan bulan ini'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-8 mb-8 shadow-lg">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">
            Selamat Datang di SI-KADAL
          </h1>
          <p className="text-xl mb-2">
            Sistem Informasi Siliwangi Kader Digital
          </p>
          <p className="text-blue-100">
            Posyandu Desa Kedungwuluh - Sistem pendataan kesehatan digital untuk balita, lansia, dan ibu hamil
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              href={card.link}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} text-white p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {card.title}
              </h3>
              <p className="text-3xl font-bold text-gray-800 mb-2">
                {loading ? '...' : card.value}
              </p>
              <p className="text-xs text-gray-500">
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Fitur Utama</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <strong className="text-gray-800">Pendataan Otomatis</strong>
                <p className="text-sm text-gray-600">Data warga dan hasil pengukuran tersimpan digital</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <strong className="text-gray-800">Indikator Status Kesehatan</strong>
                <p className="text-sm text-gray-600">Merah, kuning, hijau untuk monitoring cepat</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <strong className="text-gray-800">Deteksi Dini Penyakit</strong>
                <p className="text-sm text-gray-600">Identifikasi stunting, obesitas, hipertensi, dll</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <strong className="text-gray-800">Rekomendasi Otomatis</strong>
                <p className="text-sm text-gray-600">Saran penanganan berdasarkan hasil pengukuran</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Panduan Penggunaan</h2>
          <ol className="space-y-3">
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">1</span>
              <div>
                <strong className="text-gray-800">Tambah Data Warga</strong>
                <p className="text-sm text-gray-600">Masukkan data warga sesuai kategori (Balita/Lansia/Ibu Hamil)</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">2</span>
              <div>
                <strong className="text-gray-800">Input Hasil Pengukuran</strong>
                <p className="text-sm text-gray-600">Catat berat badan, tinggi badan, dan data kesehatan lainnya</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">3</span>
              <div>
                <strong className="text-gray-800">Lihat Status Kesehatan</strong>
                <p className="text-sm text-gray-600">Sistem otomatis menghitung indikator dan memberikan rekomendasi</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">4</span>
              <div>
                <strong className="text-gray-800">Download Laporan</strong>
                <p className="text-sm text-gray-600">Generate dan unduh laporan bulanan untuk arsip</p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Akses Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/balita"
            className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
          >
            <div className="flex items-center">
              <Baby className="w-8 h-8 text-blue-600 mr-3" />
              <span className="font-medium text-gray-800">Data Balita</span>
            </div>
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/lansia"
            className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
          >
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <span className="font-medium text-gray-800">Data Lansia</span>
            </div>
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/ibu-hamil"
            className="flex items-center justify-between p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition"
          >
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-pink-600 mr-3" />
              <span className="font-medium text-gray-800">Data Ibu Hamil</span>
            </div>
            <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}