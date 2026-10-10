import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { Award, CheckCircle2, Clock, AlertCircle, Sparkles, Monitor, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DefenseView: React.FC = () => {
  const { chapters, tasks, supervisions } = useAuthGroup();

  const babAllDone = chapters.filter((c) => c.status === 'Disetujui').length;
  const babAllTotal = chapters.length || 1;
  const percentBabAll = Math.round((babAllDone / babAllTotal) * 100);

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const defenseReqs = [
    { name: 'Naskah Lengkap Bab I–V Disetujui Pembimbing', isDone: percentBabAll === 100, detail: `${babAllDone}/${babAllTotal} Subbab ACC Dosen` },
    { name: 'Penyelesaian Persyaratan Administrasi & Akademik', isDone: tasks.some((t) => t.title.toLowerCase().includes('administrasi') && t.status === 'Selesai'), detail: 'Berkas pendaftaran sidang' },
    { name: 'Slide Presentasi Sidang Skripsi (15–20 Slide)', isDone: tasks.some((t) => t.title.toLowerCase().includes('slide') && t.stage.includes('SIDANG') && t.status === 'Selesai'), detail: 'Masalah, Metode, Hasil, & Kontribusi' },
    { name: 'Persiapan & Pengujian Demonstrasi Sistem / Prototipe', isDone: tasks.some((t) => t.title.toLowerCase().includes('demo') && t.status === 'Selesai'), detail: 'Aplikasi Web / IoT / ML Model Siap Demo' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#081c15] text-white p-6 sm:p-8 rounded-2xl border border-[#1b4332] shadow-lg space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[#d4af37] font-serif font-bold text-sm">
              <Award className="w-5 h-5" /> Sidang Akhir Skripsi
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white mt-1">
              Persiapan & Pelaksanaan Sidang
            </h1>
            <p className="text-xs text-emerald-100/80 mt-1">
              Modul pengecekan kelengkapan naskah Bab I–V, simulasi presentasi, dan persetujuan penguji.
            </p>
          </div>

          <button
            onClick={triggerCelebration}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-[#d4af37] text-[#081c15] font-bold rounded-xl text-xs hover:bg-[#c59b27] transition shadow-md"
          >
            <Sparkles className="w-4 h-4" /> Rayakan Kelulusan!
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-[#081c15]">Progres Naskah Bab I–V</h3>
            <span className="font-bold text-[#1b4332] text-sm">{percentBabAll}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-[#2d6a4f] h-2.5 rounded-full" style={{ width: `${percentBabAll}%` }} />
          </div>
          <p className="text-xs text-slate-500">
            {babAllDone} dari {babAllTotal} subbab laporan lengkap berstatus ACC Dosen.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-serif font-bold text-sm text-[#081c15]">Status Rekomendasi Sidang</h3>
          <div className="flex items-center gap-2">
            {percentBabAll === 100 ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Naskah Lengkap & Siap Sidang
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-600" /> Selesaikan Naskah Bab IV & V
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            *Pendaftaran sidang wajib menyertakan naskah final Bab I-V dan persetujuan tertulis pembimbing.
          </p>
        </div>
      </div>

      {/* Checklists for Defense Readiness */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-base text-[#081c15]">Checklist Syarat Sidang Skripsi</h3>

        <div className="space-y-3">
          {defenseReqs.map((req, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border flex items-center justify-between text-xs transition ${
                req.isDone ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold shrink-0 ${
                    req.isDone ? 'bg-[#2d6a4f] text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {req.isDone ? '✓' : idx + 1}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{req.name}</div>
                  <div className="text-[11px] text-slate-500">{req.detail}</div>
                </div>
              </div>

              <span
                className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                  req.isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {req.isDone ? 'Selesai' : 'Belum Dimulai'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
