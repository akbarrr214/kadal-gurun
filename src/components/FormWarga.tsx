'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, UserPlus, X, AlertCircle } from 'lucide-react';

interface FormWargaProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialKategori?: 'balita' | 'lansia' | 'ibu_hamil';
}

export default function FormWarga({ onSuccess, onCancel, initialKategori = 'balita' }: FormWargaProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        nik: '',
        nama: '',
        jenis_kelamin: 'Laki-laki',
        tanggal_lahir: '',
        kategori: initialKategori, // default from prop
        alamat: '',
        nama_orang_tua: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: err } = await supabase
                .from('warga')
                .insert({
                    nik: formData.nik,
                    nama: formData.nama,
                    jenis_kelamin: formData.jenis_kelamin,
                    tanggal_lahir: formData.tanggal_lahir,
                    kategori: formData.kategori,
                    alamat: formData.alamat,
                    nama_orang_tua: formData.nama_orang_tua || null,
                });

            if (err) throw err;

            if (onSuccess) {
                onSuccess();
            } else {
                router.refresh();
                setFormData({
                    nik: '',
                    nama: '',
                    jenis_kelamin: 'Laki-laki',
                    tanggal_lahir: '',
                    kategori: 'balita',
                    alamat: '',
                    nama_orang_tua: '',
                })
                alert('Data warga berhasil ditambahkan!');
            }
        } catch (err: any) {
            console.error('Error adding warga:', err);
            // Handle unique constraint error specifically if possible
            if (err.code === '23505') {
                setError('NIK sudah terdaftar.');
            } else {
                setError(err.message || 'Gagal menyimpan data.');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                    Tambah Data Warga
                </h2>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>NIK</label>
                        <input
                            type="text"
                            name="nik"
                            required
                            maxLength={16}
                            value={formData.nik}
                            onChange={handleChange}
                            className={inputClasses}
                            placeholder="16 digit NIK"
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>Nama Lengkap</label>
                        <input
                            type="text"
                            name="nama"
                            required
                            value={formData.nama}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Jenis Kelamin</label>
                        <select
                            name="jenis_kelamin"
                            value={formData.jenis_kelamin}
                            onChange={handleChange}
                            className={inputClasses}
                        >
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>Tanggal Lahir</label>
                        <input
                            type="date"
                            name="tanggal_lahir"
                            required
                            value={formData.tanggal_lahir}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClasses}>Kategori</label>
                    <select
                        name="kategori"
                        value={formData.kategori}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value="balita">Balita (0-5 Tahun)</option>
                        <option value="lansia">Lansia (60+ Tahun)</option>
                        <option value="ibu_hamil">Ibu Hamil</option>
                    </select>
                </div>

                <div>
                    <label className={labelClasses}>Alamat</label>
                    <textarea
                        name="alamat"
                        rows={2}
                        value={formData.alamat}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="Alamat lengkap RT/RW"
                    />
                </div>

                {formData.kategori === 'balita' && (
                    <div>
                        <label className={labelClasses}>Nama Orang Tua/Wali</label>
                        <input
                            type="text"
                            name="nama_orang_tua"
                            value={formData.nama_orang_tua}
                            onChange={handleChange}
                            className={inputClasses}
                        />
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
                        >
                            Batal
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Masiproses...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Simpan Warga
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
