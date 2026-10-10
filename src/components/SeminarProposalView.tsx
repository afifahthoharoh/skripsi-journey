import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { GraduationCap, CheckCircle2, Clock, AlertCircle, FileText, Calendar, Plus, X } from 'lucide-react';

export const SeminarProposalView: React.FC = () => {
  const { group, chapters, supervisions, tasks } = useAuthGroup();

  const bab13Done = chapters.filter((c) => (c.chapter === 'Bab I' || c.chapter === 'Bab II' || c.chapter === 'Bab III') && c.status === 'Disetujui').length;
  const bab13Total = chapters.filter((c) => c.chapter === 'Bab I' || c.chapter === 'Bab II' || c.chapter === 'Bab III').length || 1;
  const percentBab13 = Math.round((bab13Done / bab13Total) * 100);

  const semproApproved = supervisions.some((s) => s.topic.toLowerCase().includes('sempro') && s.status === 'Selesai & ACC');

  const requirements = [
    { name: 'Penyelesaian Draf Bab I–III Lengkap', isDone: percentBab13 === 100, detail: `${bab13Done}/${bab13Total} Subbab Disetujui` },
    { name: 'Persetujuan Dosen Pembimbing untuk Sempro', isDone: semproApproved, detail: semproApproved ? 'Persetujuan Dicatat' : 'Menunggu ACC Dosen' },
    { name: 'Slide Presentasi Seminar Proposal (10–15 Slide)', isDone: tasks.some((t) => t.title.toLowerCase().includes('slide') && t.status === 'Selesai'), detail: 'Mencakup Masalah, Metode, & Plan' },
    { name: 'Latihan Presentasi & Tanya Jawab Kelompok', isDone: tasks.some((t) => t.title.toLowerCase().includes('latihan') && t.status === 'Selesai'), detail: 'Batas waktu presentation 15 menit' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#081c15] text-white p-6 sm:p-8 rounded-2xl border border-[#1b4332] shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-[#d4af37] font-serif font-bold text-sm">
          <GraduationCap className="w-5 h-5" /> Tahapan Milestone
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white">
          Seminar Proposal (Sempro)
        </h1>
        <p className="text-xs text-emerald-100/80">
          Modul pendaftaran, pemeriksaan kesiapan naskah Bab I–III, latihan presentasi, dan evaluasi hasil Sempro.
        </p>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-[#081c15]">Progres Bab I–III</h3>
            <span className="font-bold text-[#1b4332] text-sm">{percentBab13}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div className="bg-[#2d6a4f] h-2.5 rounded-full" style={{ width: `${percentBab13}%` }} />
          </div>
          <p className="text-xs text-slate-500">
            {bab13Done} dari {bab13Total} subbab proposal telah berstatus ACC Dosen.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-serif font-bold text-sm text-[#081c15]">Status Rekomendasi Sempro</h3>
          <div className="flex items-center gap-2">
            {percentBab13 === 100 ? (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Siap Daftar Seminar Proposal
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-600" /> Belum Memenuhi Syarat Bab I-III
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            *Keputusan pendaftaran final mengikuti konfirmasi Dosen Pembimbing dan ketentuan akademik UKRI.
          </p>
        </div>
      </div>

      {/* Checklists for Sempro Readiness */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-base text-[#081c15]">Checklist Persyaratan Seminar Proposal</h3>

        <div className="space-y-3">
          {requirements.map((req, idx) => (
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
