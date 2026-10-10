import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { RECOMMENDED_THEMES } from '../data/defaultChecklists';
import { Users, LogIn, Sparkles, PlusCircle, UserCheck, ShieldCheck, BookOpen, CheckCircle, Copy } from 'lucide-react';

export const AuthAndSetup: React.FC = () => {
  const {
    currentUser,
    loadingAuth,
    group,
    loginWithGoogle,
    createNewGroup,
    joinExistingGroup,
  } = useAuthGroup();

  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [groupName, setGroupName] = useState('');
  const [theme, setTheme] = useState('');
  const [location, setLocation] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [nim, setNim] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#1b4332] font-medium">Memuat data Skripsi Journey...</p>
      </div>
    );
  }

  // Step 1: Not logged in -> Show Google Sign In screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-[#081c15] via-[#1b4332] to-[#2d6a4f] p-8 text-white text-center relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 mb-4 shadow-inner">
              <BookOpen className="w-8 h-8 text-[#d4af37]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">Skripsi Journey</h1>
            <p className="text-emerald-100 text-sm mt-2">
              Research Tracker Pendamping Skripsi Kelompok Teknik Informatika
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d4af37]/20 text-[#e6cb78] text-xs font-semibold">
              <Users className="w-3.5 h-3.5" /> Tepat 3 Mahasiswa per Kelompok
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                Fitur Utama Kelompok
              </h3>
              <ul className="text-xs text-slate-6 Pembagian tugas terstruktur dari Tahap A hingga N space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#2d6a4f] shrink-0 mt-0.5" />
                  <span>Sinkronisasi otomatis real-time Firestore untuk 3 anggota kelompok</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#2d6a4f] shrink-0 mt-0.5" />
                  <span>Checklist lengkap Tahap A–N, Mind Map interaktif, & Matriks Jurnal</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#2d6a4f] shrink-0 mt-0.5" />
                  <span>Satu tema besar dengan 3 judul, rumusan masalah & kontribusi terpisah</span>
                </li>
              </ul>
            </div>

            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-[#1b4332] hover:bg-[#081c15] text-white font-semibold rounded-xl shadow-md transition-all hover:shadow-lg text-sm group"
            >
              <LogIn className="w-5 h-5 text-[#d4af37] group-hover:scale-110 transition-transform" />
              <span>Masuk dengan Akun Google</span>
            </button>

            <p className="text-center text-xs text-slate-500">
              Gratis tanpa biaya (Firebase Spark Plan). Data tersimpan aman dan terenkripsi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Logged in, but has no group -> Create or Join Group
  if (!group) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-emerald-100 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-[#2d6a4f] mb-1">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#081c15]">
              Selamat Datang, {currentUser.displayName || 'Mahasiswa'}!
            </h2>
            <p className="text-xs text-slate-600">
              Pilih untuk **Membuat Kelompok Baru** atau **Bergabung ke Kelompok** yang sudah dibuat oleh teman sekelompokmu.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
              {errorMessage}
            </div>
          )}

          {mode === 'choose' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => { setErrorMessage(''); setMode('create'); }}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-emerald-50 to-white hover:from-emerald-100 border-2 border-emerald-200 hover:border-[#2d6a4f] rounded-2xl text-center space-y-3 transition-all shadow-sm hover:shadow-md group"
              >
                <div className="p-3 bg-[#1b4332] text-white rounded-xl shadow group-hover:scale-105 transition-transform">
                  <PlusCircle className="w-7 h-7 text-[#d4af37]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1b4332] text-sm">Buat Kelompok Baru</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Sebagai Ketua Kelompok. Dapatkan kode undangan untuk 2 anggota lain.
                  </p>
                </div>
              </button>

              <button
                onClick={() => { setErrorMessage(''); setMode('join'); }}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-white hover:from-amber-100 border-2 border-amber-200 hover:border-amber-500 rounded-2xl text-center space-y-3 transition-all shadow-sm hover:shadow-md group"
              >
                <div className="p-3 bg-[#d4af37] text-white rounded-xl shadow group-hover:scale-105 transition-transform">
                  <UserCheck className="w-7 h-7 text-[#081c15]" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Bergabung ke Kelompok</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Masukkan 6 digit kode undangan dari Ketua Kelompokmu.
                  </p>
                </div>
              </button>
            </div>
          )}

          {mode === 'create' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                setErrorMessage('');
                try {
                  await createNewGroup(groupName, theme, location, nim);
                } catch (err: any) {
                  setErrorMessage(err.message || 'Gagal membuat kelompok.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4 pt-2"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nama Kelompok Skripsi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelompok Smart Farming IF-01"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">NIM Mahasiswa (Ketua) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 211011001"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Tema Besar Penelitian *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Otomasi Irigasi & Distribusi Air Sawah"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                />
                <p className="text-[11px] text-slate-500">
                  Rekomendasi tema:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {RECOMMENDED_THEMES.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTheme(item.title)}
                      className="text-[10px] px-2 py-1 bg-emerald-50 text-[#2d6a4f] border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
                    >
                      + {item.title.split('&')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Lokasi / Mitra Penelitian *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Perkebunan Buah Desa Sukamaju / Dinas Pertanian"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('choose')}
                  className="w-1/3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-[#1b4332] hover:bg-[#081c15] text-white font-semibold rounded-xl text-xs shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Buat Kelompok & Dapatkan Kode'}
                </button>
              </div>
            </form>
          )}

          {mode === 'join' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                setErrorMessage('');
                try {
                  await joinExistingGroup(inviteCode, nim);
                } catch (err: any) {
                  setErrorMessage(err.message || 'Gagal bergabung ke kelompok.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4 pt-2"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Kode Undangan Kelompok (6 Digit) *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Contoh: A8K3P2"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border-2 border-amber-300 focus:border-amber-500 rounded-xl text-center font-mono font-bold text-xl uppercase tracking-widest focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 text-center">
                  Minta 6 digit kode dari Ketua Kelompokmu.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">NIM Mahasiswa *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 211011002"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-[#2d6a4f] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('choose')}
                  className="w-1/3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || inviteCode.length < 6}
                  className="w-2/3 py-2.5 bg-[#d4af37] hover:bg-[#c59b27] text-[#081c15] font-bold rounded-xl text-xs shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Memeriksa Kode...' : 'Validasi & Bergabung'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return null;
};
