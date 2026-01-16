'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Warga } from '@/types';
import {
    analisisBalita,
    analisisLansia,
    analisisIbuHamil,
    hitungUmurBulan
} from '@/lib/calculations';
import { Loader2, Save, AlertCircle } from 'lucide-react';

interface FormPengukuranProps {
    warga: Warga;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function FormPengukuran({ warga, onSuccess, onCancel }: FormPengukuranProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        tanggal_pengukuran: new Date().toISOString().split('T')[0],
        berat_badan: '',
        tinggi_badan: '',
        lingkar_lengan: '',
        lingkar_kepala: '',
        tekanan_darah_sistolik: '',
        tekanan_darah_diastolik: '',
        gula_darah: '',
        kolesterol: '',
        usia_kehamilan: '',
        hb: '',
        catatan: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {

            const commonData = {
                warga_id: warga.id,
                tanggal_pengukuran: formData.tanggal_pengukuran,
                catatan: formData.catatan || null,
            };

            // Helper to parse numbers safely and prevent overflow
            const parseNum = (val: string) => {
                if (!val) return null;
                const num = parseFloat(val);
                if (isNaN(num)) return null;
                // Clamp to prevent overflow (Postgres numeric/integer limits)
                if (num > 999.99) return 999.99;
                return num;
            };

            if (warga.kategori === 'balita') {
                const umurBulan = hitungUmurBulan(warga.tanggal_lahir);
                const berat = parseNum(formData.berat_badan);
                const tinggi = parseNum(formData.tinggi_badan);
                const lila = parseNum(formData.lingkar_lengan);
                const lingkarKepala = parseNum(formData.lingkar_kepala);

                const analisis = analisisBalita(
                    berat || undefined,
                    tinggi || undefined,
                    lila || undefined,
                    lingkarKepala || undefined,
                    umurBulan,
                    warga.jenis_kelamin || 'Laki-laki'
                );

                const { error: err } = await supabase
                    .from('pengukuran_balita')
                    .insert({
                        ...commonData,
                        berat_badan: berat,
                        tinggi_badan: tinggi,
                        lingkar_lengan: lila,
                        lingkar_kepala: lingkarKepala,
                        status_gizi: analisis.statusGizi,
                        indikator: analisis.indikator,
                        indikasi_penyakit: analisis.indikasiPenyakit,
                        rekomendasi: analisis.rekomendasi,
                    });

                if (err) throw err;

            } else if (warga.kategori === 'lansia') {
                const berat = parseNum(formData.berat_badan);
                const tinggi = parseNum(formData.tinggi_badan);
                const sistolik = parseNum(formData.tekanan_darah_sistolik);
                const diastolik = parseNum(formData.tekanan_darah_diastolik);
                const gula = parseNum(formData.gula_darah);
                const koles = parseNum(formData.kolesterol);

                const analisis = analisisLansia(
                    berat || undefined,
                    tinggi || undefined,
                    sistolik || undefined,
                    diastolik || undefined,
                    gula || undefined,
                    koles || undefined
                );

                const { error: err } = await supabase
                    .from('pengukuran_lansia')
                    .insert({
                        ...commonData,
                        berat_badan: berat,
                        tinggi_badan: tinggi,
                        tekanan_darah_sistolik: sistolik,
                        tekanan_darah_diastolik: diastolik,
                        gula_darah: gula,
                        kolesterol: koles,
                        indikator: analisis.indikator,
                        indikasi_penyakit: analisis.indikasiPenyakit,
                        rekomendasi: analisis.rekomendasi,
                    });

                if (err) throw err;

            } else if (warga.kategori === 'ibu_hamil') {
                const usiaHamil = parseNum(formData.usia_kehamilan);
                const berat = parseNum(formData.berat_badan);
                const tinggi = parseNum(formData.tinggi_badan);
                const lila = parseNum(formData.lingkar_lengan);
                const sistolik = parseNum(formData.tekanan_darah_sistolik);
                const diastolik = parseNum(formData.tekanan_darah_diastolik);
                const hb = parseNum(formData.hb);

                const analisis = analisisIbuHamil(
                    usiaHamil || undefined,
                    berat || undefined,
                    tinggi || undefined,
                    lila || undefined,
                    sistolik || undefined,
                    diastolik || undefined,
                    hb || undefined
                );

                const { error: err } = await supabase
                    .from('pengukuran_ibu_hamil')
                    .insert({
                        ...commonData,
                        usia_kehamilan: usiaHamil,
                        berat_badan: berat,
                        tinggi_badan: tinggi,
                        lingkar_lengan: lila,
                        tekanan_darah_sistolik: sistolik,
                        tekanan_darah_diastolik: diastolik,
                        hb: hb,
                        indikator: analisis.indikator,
                        indikasi_penyakit: analisis.indikasiPenyakit,
                        rekomendasi: analisis.rekomendasi,
                    });

                if (err) throw err;
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.refresh(); // Basic Next.js refresh
                // Reset form
                setFormData(prev => ({
                    ...prev,
                    catatan: '',
                    berat_badan: '',
                    // ... reset others if needed, but keeping date is usually good
                }));
                alert('Data pengukuran berhasil disimpan!');
            }

        } catch (err: any) {
            console.error('Error submitting form:', err);
            setError(err.message || 'Terjadi kesalahan saat menyimpan data.');
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                    Input Pengukuran - <span className="text-blue-600 capitalize">{warga.nama}</span>
                </h2>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium capitalize">
                    {warga.kategori.replace('-', ' ')}
                </span>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tanggal Pengukuran - Always visible */}
                <div>
                    <label className={labelClasses}>Tanggal Pengukuran</label>
                    <input
                        type="date"
                        name="tanggal_pengukuran"
                        required
                        value={formData.tanggal_pengukuran}
                        onChange={handleChange}
                        className={inputClasses}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fields for Balita */}
                    {warga.kategori === 'balita' && (
                        <>
                            <div>
                                <label className={labelClasses}>Berat Badan (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="berat_badan"
                                    value={formData.berat_badan}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Tinggi/Panjang Badan (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="tinggi_badan"
                                    value={formData.tinggi_badan}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    placeholder="0.0"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Lingkar Lengan (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="lingkar_lengan"
                                    value={formData.lingkar_lengan}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    placeholder="0.0"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Lingkar Kepala (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="lingkar_kepala"
                                    value={formData.lingkar_kepala}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    placeholder="0.0"
                                />
                            </div>
                        </>
                    )}

                    {/* Fields for Lansia */}
                    {warga.kategori === 'lansia' && (
                        <>
                            <div>
                                <label className={labelClasses}>Berat Badan (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="berat_badan"
                                    value={formData.berat_badan}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Tinggi Badan (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="tinggi_badan"
                                    value={formData.tinggi_badan}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Tekanan Darah (Sistolik/Diastolik)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        name="tekanan_darah_sistolik"
                                        value={formData.tekanan_darah_sistolik}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="Sistolik (mmHg)"
                                    />
                                    <span className="flex items-center text-gray-400">/</span>
                                    <input
                                        type="number"
                                        name="tekanan_darah_diastolik"
                                        value={formData.tekanan_darah_diastolik}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="Diastolik (mmHg)"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>Gula Darah (mg/dL)</label>
                                <input
                                    type="number"
                                    name="gula_darah"
                                    value={formData.gula_darah}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Kolesterol (mg/dL)</label>
                                <input
                                    type="number"
                                    name="kolesterol"
                                    value={formData.kolesterol}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>
                        </>
                    )}

                    {/* Fields for Ibu Hamil */}
                    {warga.kategori === 'ibu_hamil' && (
                        <>
                            <div>
                                <label className={labelClasses}>Usia Kehamilan (minggu)</label>
                                <input
                                    type="number"
                                    name="usia_kehamilan"
                                    value={formData.usia_kehamilan}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Berat Badan (kg)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="berat_badan"
                                    value={formData.berat_badan}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Tinggi Badan (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="tinggi_badan"
                                    value={formData.tinggi_badan}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Tekanan Darah (Sistolik/Diastolik)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        name="tekanan_darah_sistolik"
                                        value={formData.tekanan_darah_sistolik}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="Sys"
                                    />
                                    <span className="flex items-center text-gray-400">/</span>
                                    <input
                                        type="number"
                                        name="tekanan_darah_diastolik"
                                        value={formData.tekanan_darah_diastolik}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        placeholder="Dia"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClasses}>Lingkar Lengan (cm)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="lingkar_lengan"
                                    value={formData.lingkar_lengan}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Hemoglobin (Hb) (g/dL)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="hb"
                                    value={formData.hb}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Catatan - Common */}
                <div>
                    <label className={labelClasses}>Catatan Tambahan</label>
                    <textarea
                        name="catatan"
                        value={formData.catatan}
                        onChange={handleChange}
                        className={`${inputClasses} min-h-[100px] resize-y`}
                        placeholder="Keluhan atau catatan khusus..."
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            disabled={loading}
                        >
                            Batal
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Simpan Data
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
