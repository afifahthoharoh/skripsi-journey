import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { RevisionItem } from '../types/skripsi';
import { saveRevisionItem, deleteRevisionItem, logActivity } from '../services/firestoreService';
import { CheckCircle2, Plus, Search, Calendar, User, ExternalLink, Trash2, Edit3, X, AlertCircle } from 'lucide-react';

export const RevisionsView: React.FC = () => {
  const { group, revisions, members, currentUser } = useAuthGroup();

  const [activeTab, setActiveTab] = useState<'Sempro' | 'Sidang'>('Sempro');
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRev, setEditingRev] = useState<RevisionItem | null>(null);

  // Form State
  const [reviewerName, setReviewerName] = useState('Dosen Penguji 1');
  const [reviewerRole, setReviewerRole] = useState<any>('Penguji Utama');
  const [notes, setNotes] = useState('');
  const [affectedChapter, setAffectedChapter] = useState('Bab I');
  const [assigneeId, setAssigneeId] = useState('all');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<any>('Belum Dikerjakan');
  const [proofUrl, setProofUrl] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');

  const openCreateModal = () => {
    setEditingRev(null);
    setReviewerName('Dosen Penguji 1');
    setReviewerRole('Penguji Utama');
    setNotes('');
    setAffectedChapter('Bab I');
    setAssigneeId('all');
    setDeadline('');
    setStatus('Belum Dikerjakan');
    setProofUrl('');
    setVerificationNotes('');
    setModalOpen(true);
  };

  const openEditModal = (r: RevisionItem) => {
    setEditingRev(r);
    setReviewerName(r.reviewerName);
    setReviewerRole(r.reviewerRole);
    setNotes(r.notes);
    setAffectedChapter(r.affectedChapter);
    setAssigneeId(r.assigneeId);
    setDeadline(r.deadline || '');
    setStatus(r.status);
    setProofUrl(r.proofUrl || '');
    setVerificationNotes(r.verificationNotes || '');
    setModalOpen(true);
  };

  const handleSaveRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !notes.trim()) return;

    const revData: RevisionItem = {
      id: editingRev ? editingRev.id : `rev_${Date.now()}`,
      groupId: group.id,
      type: activeTab,
      reviewerName,
      reviewerRole,
      notes,
      affectedChapter,
      assigneeId,
      deadline,
      status,
      proofUrl,
      verificationNotes,
      updatedAt: new Date().toISOString(),
    };

    await saveRevisionItem(group.id, revData);
    await logActivity(
      group.id,
      currentUser?.displayName || 'Mahasiswa',
      currentUser?.uid || '',
      editingRev ? 'Edit Revisi Penguji' : 'Catat Revisi Penguji',
      `Revisi ${activeTab} dari ${reviewerName}`
    );
    setModalOpen(false);
  };

  const handleDeleteRev = async (id: string, n: string) => {
    if (!group || !confirm(`Hapus catatan revisi penguji ini?`)) return;
    await deleteRevisionItem(group.id, id);
    await logActivity(group.id, currentUser?.displayName || 'Mahasiswa', currentUser?.uid || '', 'Hapus Revisi', `Menghapus catatan revisi penguji`);
  };

  const currentRevisions = revisions.filter((r) => r.type === activeTab);
  const filteredRevisions = currentRevisions.filter(
    (r) =>
      r.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.affectedChapter.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-2xl text-[#081c15] flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[#2d6a4f]" />
            Catat & Pantau Revisi Penguji
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Log perbaikan pascaseminar proposal dan pascasidang akhir skripsi per Dosen Penguji.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1b4332] hover:bg-[#081c15] text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" /> Catat Revisi Penguji
        </button>
      </div>

      {/* Tabs for Sempro vs Sidang Revisions */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('Sempro')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'Sempro'
              ? 'bg-[#1b4332] text-white shadow-xs'
              : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200'
          }`}
        >
          Revisi Seminar Proposal ({revisions.filter((r) => r.type === 'Sempro').length})
        </button>

        <button
          onClick={() => setActiveTab('Sidang')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'Sidang'
              ? 'bg-[#1b4332] text-white shadow-xs'
              : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200'
          }`}
        >
          Revisi Sidang Skripsi ({revisions.filter((r) => r.type === 'Sidang').length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari penguji, bab terdampak, atau catatan revisi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs focus:outline-none"
        />
      </div>

      {/* Revision Items List */}
      <div className="space-y-3">
        {filteredRevisions.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada catatan revisi penguji {activeTab}</p>
            <p className="text-xs text-slate-500">Klik &ldquo;Catat Revisi Penguji&rdquo; untuk menginput catatan masukan penguji.</p>
          </div>
        ) : (
          filteredRevisions.map((rev) => {
            const assignee = members.find((m) => m.id === rev.assigneeId);

            return (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {rev.affectedChapter}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">
                      {rev.reviewerName} ({rev.reviewerRole})
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        rev.status === 'Disetujui'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rev.status === 'Menunggu ACC'
                          ? 'bg-blue-100 text-blue-800'
                          : rev.status === 'Proses Revisi'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {rev.status}
                    </span>

                    <button onClick={() => openEditModal(rev)} className="p-1 text-slate-500 hover:text-[#1b4332] rounded">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteRev(rev.id, rev.notes)} className="p-1 text-slate-400 hover:text-red-600 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 space-y-1 text-xs">
                  <div className="font-bold text-amber-900">Poin Revisi / Masukan Penguji:</div>
                  <p className="text-amber-900/90 leading-relaxed">{rev.notes}</p>
                </div>

                {rev.verificationNotes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <strong>Catatan Perubahan:</strong> {rev.verificationNotes}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <span>
                      <User className="w-3 h-3 inline mr-1" />
                      PJ: <strong>{assignee?.displayName || 'Semua Anggota'}</strong>
                    </span>

                    {rev.deadline && (
                      <span className="font-mono text-red-600 font-semibold">
                        Deadline: {rev.deadline}
                      </span>
                    )}
                  </div>

                  {rev.proofUrl && (
                    <a
                      href={rev.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Bukti Perbaikan Naskah
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add / Edit Revision */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSaveRevision}
            className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-emerald-100 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#081c15]">
                Catat Revisi Penguji {activeTab}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama Dosen Penguji *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Dr. Budi Penguji 1"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Peran Penguji *</label>
                <select
                  value={reviewerRole}
                  onChange={(e) => setReviewerRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                >
                  <option value="Penguji Utama">Penguji Utama</option>
                  <option value="Penguji Pendamping">Penguji Pendamping</option>
                  <option value="Dosen Pembimbing">Dosen Pembimbing</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Bab / Bagian Terdampak *</label>
                <select
                  value={affectedChapter}
                  onChange={(e) => setAffectedChapter(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                >
                  <option value="Bab I">Bab I</option>
                  <option value="Bab II">Bab II</option>
                  <option value="Bab III">Bab III</option>
                  <option value="Bab IV">Bab IV</option>
                  <option value="Bab V">Bab V</option>
                  <option value="Sistem / Program">Sistem / Program Demo</option>
                  <option value="Format & Daftar Pustaka">Format & Daftar Pustaka</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Penanggung Jawab Revisi *</label>
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
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Catatan Revisi dari Penguji *</label>
              <textarea
                rows={3}
                required
                placeholder="Rincian perubahan yang diminta penguji..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Status Revisi *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                >
                  <option value="Belum Dikerjakan">Belum Dikerjakan</option>
                  <option value="Proses Revisi">Proses Revisi</option>
                  <option value="Menunggu ACC">Menunggu ACC</option>
                  <option value="Disetujui">Disetujui Penguji</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Deadline Perbaikan</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tautan Bukti Perbaikan Naskah (Drive)</label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Catatan Perubahan / Bukti Halaman</label>
              <input
                type="text"
                placeholder="Misal: Perubahan dilakukan pada Halaman 24 Paragraf 2"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-1/3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-[#1b4332] text-white rounded-xl text-xs font-semibold hover:bg-[#081c15]"
              >
                Simpan Catatan Revisi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
