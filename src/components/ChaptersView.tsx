import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { ChapterProgress, ChapterWritingStatus } from '../types/skripsi';
import { saveChapterProgress, logActivity } from '../services/firestoreService';
import { Layers, CheckCircle2, Clock, AlertCircle, ExternalLink, Edit3, Save, X, User, Users, Lock } from 'lucide-react';

export const ChaptersView: React.FC = () => {
  const { group, chapters, members, currentUser, currentUserProfile } = useAuthGroup();

  const [activeChapterTab, setActiveChapterTab] = useState<'Bab I' | 'Bab II' | 'Bab III' | 'Bab IV' | 'Bab V'>('Bab I');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');

  const [editingItem, setEditingItem] = useState<ChapterProgress | null>(null);
  const [status, setStatus] = useState<ChapterWritingStatus>('Belum Ditulis');
  const [assigneeId, setAssigneeId] = useState('all');
  const [targetDate, setTargetDate] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [notes, setNotes] = useState('');

  const canEditChapter = (item: ChapterProgress): boolean => {
    if (!currentUser) return false;
    if (item.assigneeId === currentUser.uid) return true;
    if (item.assigneeId === 'all' || currentUserProfile?.role === 'Ketua Kelompok' || group?.creatorId === currentUser.uid) return true;
    return false;
  };

  const openEditModal = (item: ChapterProgress) => {
    const author = members.find((m) => m.id === item.assigneeId);
    if (!canEditChapter(item)) {
      alert(`Akses Ditolak: Hanya penulis subbab (${author?.displayName || 'penulis asli'}) atau Ketua yang dapat mengedit status subbab ini.`);
      return;
    }

    setEditingItem(item);
    setStatus(item.status);
    setAssigneeId(item.assigneeId);
    setTargetDate(item.targetDate || '');
    setDocUrl(item.docUrl || '');
    setNotes(item.notes || '');
  };

  const handleSaveProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !editingItem) return;

    const updatedItem: ChapterProgress = {
      ...editingItem,
      status,
      assigneeId,
      targetDate,
      docUrl,
      notes,
      updatedAt: new Date().toISOString(),
    };

    await saveChapterProgress(group.id, updatedItem);
    await logActivity(
      group.id,
      currentUser?.displayName || 'Mahasiswa',
      currentUser?.uid || '',
      'Update Status Subbab',
      `Subbab "${editingItem.subChapter}" (${status})`
    );
    setEditingItem(null);
  };

  const currentChapterSubsections = chapters.filter((c) => {
    const matchesChap = c.chapter === activeChapterTab;
    const matchesMember = selectedMemberId === 'all' || c.assigneeId === selectedMemberId || c.assigneeId === 'all';
    return matchesChap && matchesMember;
  });

  const getStatusBadge = (st: ChapterWritingStatus) => {
    switch (st) {
      case 'Disetujui':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">Disetujui Dosen</span>;
      case 'Sedang Ditulis':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">Sedang Ditulis</span>;
      case 'Menunggu Bimbingan':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200">Menunggu Bimbingan</span>;
      case 'Perlu Revisi':
        return <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold border border-red-200">Perlu Revisi</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">Belum Ditulis</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="font-serif font-bold text-2xl text-[#081c15] flex items-center gap-2">
          <Layers className="w-6 h-6 text-[#2d6a4f]" />
          Modul Bab I–V & Subbab Penulisan
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Pelacakan progres per subbab laporan dari Latar Belakang hingga Kesimpulan & Saran.
        </p>
      </div>

      {/* Student Progress Inspection Filter Bar */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-100/80 rounded-xl text-[#1b4332]">
            <Users className="w-5 h-5 text-[#2d6a4f]" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-[#081c15]">Pantau Subbab Penulisan Anggota</h3>
            <p className="text-[11px] text-slate-500">
              Pilih nama mahasiswa untuk memantau status draf subbab penulisan skripsi individu mereka.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0">
          <button
            onClick={() => setSelectedMemberId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedMemberId === 'all'
                ? 'bg-[#1b4332] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Anggota
          </button>
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMemberId(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedMemberId === m.id
                  ? 'bg-[#588157] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{m.displayName}</span>
              <span className="text-[10px] opacity-80 font-bold">({m.role})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chapter Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {(['Bab I', 'Bab II', 'Bab III', 'Bab IV', 'Bab V'] as const).map((chap) => {
          const chapItems = chapters.filter((c) => c.chapter === chap);
          const doneItems = chapItems.filter((c) => c.status === 'Disetujui').length;
          const isActive = activeChapterTab === chap;

          return (
            <button
              key={chap}
              onClick={() => setActiveChapterTab(chap)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                isActive
                  ? 'bg-[#1b4332] text-white shadow-sm'
                  : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200'
              }`}
            >
              <span>{chap}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-[#d4af37] text-[#081c15]' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {doneItems}/{chapItems.length} ACC
              </span>
            </button>
          );
        })}
      </div>

      {/* Subsections List for Selected Chapter */}
      <div className="space-y-3">
        {currentChapterSubsections.map((item) => {
          const assignee = members.find((m) => m.id === item.assigneeId);

          return (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{item.subChapter}</h4>
                    {getStatusBadge(item.status)}
                  </div>
                  {item.notes && <p className="text-xs text-slate-600">{item.notes}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.docUrl && (
                    <a
                      href={item.docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-50 text-[#1b4332] border border-emerald-200 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Draf Dokumen
                    </a>
                  )}

                  {canEditChapter(item) ? (
                    <button
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-[#1b4332] text-slate-700 hover:text-white rounded-xl text-xs font-semibold transition border border-slate-200 flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Status
                    </button>
                  ) : (
                    <button
                      onClick={() => openEditModal(item)}
                      title={`Hanya ${assignee?.displayName || 'penulis'} yang dapat mengedit subbab ini`}
                      className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold transition border border-slate-200 flex items-center gap-1 cursor-not-allowed"
                    >
                      <Lock className="w-3.5 h-3.5" /> Dikuci ({assignee?.displayName || 'Anggota'})
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Penulis: {assignee?.displayName || 'Semua Anggota'}
                </span>

                {item.targetDate && (
                  <span className="font-mono text-[#2d6a4f] font-semibold">
                    Target ACC: {item.targetDate}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Subsection Status Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSaveProgress}
            className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-emerald-100 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-base text-[#081c15]">
                Update {editingItem.subChapter}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Status Penulisan & Bimbingan *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ChapterWritingStatus)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              >
                <option value="Belum Ditulis">Belum Ditulis</option>
                <option value="Sedang Ditulis">Sedang Ditulis</option>
                <option value="Menunggu Bimbingan">Menunggu Bimbingan</option>
                <option value="Perlu Revisi">Perlu Revisi</option>
                <option value="Disetujui">Disetujui Dosen (ACC)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Penanggung Jawab Penulisan *</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              >
                <option value="all">Semua Anggota (Kelompok)</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.displayName} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Target Selesai / ACC</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tautan Naskah Subbab (Drive Docs)</label>
              <input
                type="url"
                placeholder="https://docs.google.com/..."
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Catatan Masukan Dosen / Catatan Penulis</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="w-1/3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-[#1b4332] text-white rounded-xl text-xs font-semibold hover:bg-[#081c15]"
              >
                Simpan Subbab
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
