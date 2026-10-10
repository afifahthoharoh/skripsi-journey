import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { SupervisionLog } from '../types/skripsi';
import { saveSupervisionLog, deleteSupervisionLog, logActivity } from '../services/firestoreService';
import { MessageSquare, Plus, Search, Calendar, User, ExternalLink, Trash2, Edit3, X, CheckCircle2 } from 'lucide-react';

export const SupervisionRevisionView: React.FC = () => {
  const { group, supervisions, members, currentUser } = useAuthGroup();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSup, setEditingSup] = useState<SupervisionLog | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [advisorName, setAdvisorName] = useState('');
  const [topic, setTopic] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [revisionList, setRevisionList] = useState('');
  const [assigneeId, setAssigneeId] = useState('all');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<any>('Perlu Revisi');
  const [proofUrl, setProofUrl] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  const openCreateModal = () => {
    setEditingSup(null);
    setDate(new Date().toISOString().split('T')[0]);
    setAdvisorName('Dosen Pembimbing 1');
    setTopic('');
    setFeedbackNotes('');
    setRevisionList('');
    setAssigneeId('all');
    setDeadline('');
    setStatus('Perlu Revisi');
    setProofUrl('');
    setApprovalNotes('');
    setModalOpen(true);
  };

  const openEditModal = (s: SupervisionLog) => {
    setEditingSup(s);
    setDate(s.date);
    setAdvisorName(s.advisorName);
    setTopic(s.topic);
    setFeedbackNotes(s.feedbackNotes);
    setRevisionList(s.revisionList);
    setAssigneeId(s.assigneeId);
    setDeadline(s.deadline);
    setStatus(s.status);
    setProofUrl(s.proofUrl || '');
    setApprovalNotes(s.approvalNotes || '');
    setModalOpen(true);
  };

  const handleSaveSupervision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !topic.trim()) return;

    const supData: SupervisionLog = {
      id: editingSup ? editingSup.id : `sup_${Date.now()}`,
      groupId: group.id,
      date,
      advisorName,
      topic,
      feedbackNotes,
      revisionList,
      assigneeId,
      deadline,
      status,
      proofUrl,
      approvalNotes,
      type: 'Rutin',
      createdAt: editingSup ? editingSup.createdAt : new Date().toISOString(),
    };

    await saveSupervisionLog(group.id, supData);
    await logActivity(
      group.id,
      currentUser?.displayName || 'Mahasiswa',
      currentUser?.uid || '',
      editingSup ? 'Edit Bimbingan' : 'Catat Bimbingan',
      `Bimbingan topik "${topic}" dengan ${advisorName}`
    );
    setModalOpen(false);
  };

  const handleDeleteSup = async (id: string, top: string) => {
    if (!group || !confirm(`Hapus log bimbingan "${top}"?`)) return;
    await deleteSupervisionLog(group.id, id);
    await logActivity(group.id, currentUser?.displayName || 'Mahasiswa', currentUser?.uid || '', 'Hapus Bimbingan', `Menghapus log "${top}"`);
  };

  const filteredSupervisions = supervisions.filter(
    (s) =>
      s.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.feedbackNotes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.advisorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-2xl text-[#081c15] flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#2d6a4f]" />
            Log Bimbingan & Revisi Rutin
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan hasil konsultasi dengan Dosen Pembimbing, catatan revisi, dan tanggal ACC.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1b4332] hover:bg-[#081c15] text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" /> Catat Bimbingan Baru
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari topik bimbingan, nama dosen, atau masukan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs focus:outline-none"
        />
      </div>

      {/* History Log List */}
      <div className="space-y-4">
        {filteredSupervisions.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada riwayat bimbingan</p>
            <p className="text-xs text-slate-500">Klik &ldquo;Catat Bimbingan Baru&rdquo; setelah berkonsultasi dengan Dosen Pembimbing.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSupervisions.map((s) => {
              const assignee = members.find((m) => m.id === s.assigneeId);

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#1b4332]">
                        <Calendar className="w-3.5 h-3.5" /> {s.date} — {s.advisorName}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">Topik: {s.topic}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          s.status === 'Selesai & ACC'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.status === 'Dalam Proses'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.status}
                      </span>

                      <button onClick={() => openEditModal(s)} className="p-1 text-slate-500 hover:text-[#1b4332] rounded">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteSup(s.id, s.topic)} className="p-1 text-slate-400 hover:text-red-600 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-800">Catatan Masukan Dosen:</div>
                      <p className="text-slate-600 leading-relaxed">{s.feedbackNotes || 'Tidak ada catatan.'}</p>
                    </div>

                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 space-y-1">
                      <div className="font-bold text-amber-900">Daftar Poin Revisi:</div>
                      <p className="text-amber-900/90 leading-relaxed">{s.revisionList || 'Tidak ada poin revisi.'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <span>
                        <User className="w-3 h-3 inline mr-1" />
                        PJ: <strong>{assignee?.displayName || 'Semua Anggota'}</strong>
                      </span>

                      {s.deadline && (
                        <span className="font-mono text-red-600 font-semibold">
                          Deadline Revisi: {s.deadline}
                        </span>
                      )}
                    </div>

                    {s.proofUrl && (
                      <a
                        href={s.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Bukti Perbaikan
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Supervision Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSaveSupervision}
            className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-emerald-100 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#081c15]">
                {editingSup ? 'Edit Log Bimbingan' : 'Catat Bimbingan Baru'}
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
                <label className="text-xs font-semibold text-slate-700">Tanggal Konsultasi *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama Dosen Pembimbing *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Dr. Ir. Ahmad Pembimbing 1"
                  value={advisorName}
                  onChange={(e) => setAdvisorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Topik / Bab yang Dibahas *</label>
              <input
                type="text"
                required
                placeholder="Misal: Review Bab I & Rumusan Masalah 3 Judul"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Catatan Masukan Dosen *</label>
              <textarea
                rows={2}
                required
                placeholder="Rincian arahan dan masukan dari dosen..."
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Poin Revisi yang Harus Diperbaiki</label>
              <textarea
                rows={2}
                placeholder="Daftar item perbaikan yang diminta..."
                value={revisionList}
                onChange={(e) => setRevisionList(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Penanggung Jawab Revisi</label>
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
                <label className="text-xs font-semibold text-slate-700">Status Bimbingan *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                >
                  <option value="Perlu Revisi">Perlu Revisi</option>
                  <option value="Dalam Proses">Dalam Proses Perbaikan</option>
                  <option value="Selesai & ACC">Selesai & ACC Dosen</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tautan Bukti Perbaikan (Drive)</label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
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
                Simpan Log Bimbingan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
