import React from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { FolderCheck, ExternalLink, CheckCircle2, ShieldCheck, FileText, Download } from 'lucide-react';

export const FinalDocsView: React.FC = () => {
  const { documents, group } = useAuthGroup();

  const finalDocs = documents.filter((d) => d.category === 'Naskah Final');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#081c15] text-white p-6 sm:p-8 rounded-2xl border border-[#1b4332] shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-[#d4af37] font-serif font-bold text-sm">
          <FolderCheck className="w-5 h-5" /> Pengumpulan Akhir
        </div>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-white">
          Dokumen Final & Serah Terima Skripsi
        </h1>
        <p className="text-xs text-emerald-100/80">
          Pengarsipan naskah final yang disetujui, lembar pengesahan, source code program, dan bukti penyerahan ke perpustakaan.
        </p>
      </div>

      {/* Final Manuscripts List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-base text-[#081c15]">Daftar Dokumen Naskah Final</h3>

        {finalDocs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada Naskah Final yang diunggah</p>
            <p className="text-xs text-slate-500">
              Tambahkan file naskah final berserta lembar pengesahan pada menu Data & Dokumen dengan kategori &ldquo;Naskah Final&rdquo;.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finalDocs.map((doc) => (
              <div key={doc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div className="font-bold text-slate-900">{doc.title}</div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Naskah Final
                  </span>
                </div>

                <p className="text-slate-600">{doc.notes || 'Naskah siap cetak / jilid.'}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-500">Pemilik: {doc.ownerName}</span>
                  <a
                    href={doc.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Buka Naskah Final
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Graduation Admin Checklist */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-serif font-bold text-base text-[#081c15]">Checklist Administrasi Kelulusan UKRI</h3>
        <ul className="text-xs text-slate-700 space-y-2">
          <li className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Naskah Hardcopy / Softcopy Terjilid Rapi Sesuai Format UKRI</span>
          </li>
          <li className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Lembar Pengesahan Bertandatangan Asli Dosen Pembimbing & Penguji</span>
          </li>
          <li className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Bukti Penyerahan CD/Flashdisk Source Code Program & Dataset ke Perpustakaan / Jurusan</span>
          </li>
          <li className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Bebas Pinjam Perpustakaan & Bebas Tunggakan UKT</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
