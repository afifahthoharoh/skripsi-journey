import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { LiteratureItem } from '../types/skripsi';
import { saveLiteratureItem, deleteLiteratureItem, logActivity } from '../services/firestoreService';
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Download,
  Trash2,
  Edit3,
  X,
  BookOpen,
  User,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';

export const LiteratureReviewView: React.FC = () => {
  const { group, literatures, members, currentUser, currentUserProfile } = useAuthGroup();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all'); // 'all' or member.id

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLit, setEditingLit] = useState<LiteratureItem | null>(null);

  // Form State
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [title, setTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [doiUrl, setDoiUrl] = useState('');
  const [researchObject, setResearchObject] = useState('');
  const [datasetCharacteristics, setDatasetCharacteristics] = useState('');
  const [method, setMethod] = useState('');
  const [results, setResults] = useState('');
  const [limitations, setLimitations] = useState('');
  const [researchGap, setResearchGap] = useState('');
  const [relationToGroup, setRelationToGroup] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<any>('Sangat Relevan');
  const [relevanceForUserId, setRelevanceForUserId] = useState('all');

  const selectedMemberObj = members.find((m) => m.id === activeTab || m.uid === activeTab);

  const openCreateModal = (targetMemberId?: string) => {
    setEditingLit(null);
    setAuthors('');
    setYear(new Date().getFullYear());
    setTitle('');
    setVenue('');
    setDoiUrl('');
    setResearchObject('');
    setDatasetCharacteristics('');
    setMethod('');
    setResults('');
    setLimitations('');
    setResearchGap('');
    setRelationToGroup('');
    setVerificationStatus('Sangat Relevan');
    setRelevanceForUserId(targetMemberId || (activeTab !== 'all' ? activeTab : currentUser?.uid || 'all'));
    setModalOpen(true);
  };

  const openEditModal = (item: LiteratureItem) => {
    const isOwner = item.createdById === currentUser?.uid || item.relevanceForUserId === currentUser?.uid || currentUserProfile?.role === 'Ketua Kelompok' || group?.creatorId === currentUser?.uid;
    if (!isOwner) {
      alert('Akses Ditolak: Anda hanya dapat mengedit referensi/research gap yang Anda tambahkan sendiri.');
      return;
    }

    setEditingLit(item);
    setAuthors(item.authors);
    setYear(item.year);
    setTitle(item.title);
    setVenue(item.venue);
    setDoiUrl(item.doiUrl || '');
    setResearchObject(item.researchObject);
    setDatasetCharacteristics(item.datasetCharacteristics);
    setMethod(item.method);
    setResults(item.results);
    setLimitations(item.limitations);
    setResearchGap(item.researchGap);
    setRelationToGroup(item.relationToGroup);
    setVerificationStatus(item.verificationStatus);
    setRelevanceForUserId(item.relevanceForUserId);
    setModalOpen(true);
  };

  const handleSaveLit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !title.trim()) return;

    const litData: LiteratureItem = {
      id: editingLit ? editingLit.id : `lit_${Date.now()}`,
      groupId: group.id,
      authors,
      year: Number(year),
      title,
      venue,
      doiUrl,
      researchObject,
      datasetCharacteristics,
      method,
      results,
      limitations,
      researchGap,
      relationToGroup,
      verificationStatus,
      relevanceForUserId,
      createdById: editingLit ? editingLit.createdById : currentUser?.uid || '',
      createdAt: editingLit ? editingLit.createdAt : new Date().toISOString(),
    };

    await saveLiteratureItem(group.id, litData);
    await logActivity(
      group.id,
      currentUser?.displayName || 'Mahasiswa',
      currentUser?.uid || '',
      editingLit ? 'Edit Matriks Jurnal' : 'Tambah Jurnal',
      `Jurnal "${title}" (${year})`
    );
    setModalOpen(false);
  };

  const handleDeleteLit = async (item: LiteratureItem) => {
    if (!group) return;
    const isOwner = item.createdById === currentUser?.uid || item.relevanceForUserId === currentUser?.uid || currentUserProfile?.role === 'Ketua Kelompok' || group?.creatorId === currentUser?.uid;
    if (!isOwner) {
      alert('Akses Ditolak: Anda hanya dapat menghapus referensi yang Anda tambahkan.');
      return;
    }

    if (!confirm(`Hapus referensi jurnal "${item.title}"?`)) return;
    await deleteLiteratureItem(group.id, item.id);
    await logActivity(group.id, currentUser?.displayName || 'Mahasiswa', currentUser?.uid || '', 'Hapus Jurnal', `Menghapus referensi "${item.title}"`);
  };

  // CSV Export Helper
  const exportToCSV = () => {
    if (literatures.length === 0) return;
    const headers = ['Penulis', 'Tahun', 'Judul Jurnal', 'Venue/Jurnal', 'Objek', 'Metode', 'Hasil Utama', 'Research Gap', 'Relevansi Mahasiswa'];
    const rows = literatures.map((l) => [
      `"${l.authors}"`,
      l.year,
      `"${l.title}"`,
      `"${l.venue}"`,
      `"${l.researchObject}"`,
      `"${l.method}"`,
      `"${l.results}"`,
      `"${l.researchGap}"`,
      `"${members.find((m) => m.id === l.relevanceForUserId || m.uid === l.relevanceForUserId)?.displayName || 'Seluruh Kelompok'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Matriks_Penelitian_Terdahulu_${group?.name || 'Skripsi'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter literatures for active tab & search term
  const filteredLits = literatures.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.researchGap.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all') {
      return matchesSearch;
    }
    const matchesMember = l.relevanceForUserId === activeTab || l.createdById === activeTab;
    return matchesSearch && matchesMember;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-2xl text-[#081c15] flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#2d6a4f]" />
            Matriks Penelitian Terdahulu & Research Gap
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Setiap anggota memiliki tabel terpisah agar matriks jurnal & temuan research gap tidak tertumpuk, namun tetap transparan dan dapat saling dipantau.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            disabled={literatures.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-emerald-50 text-[#1b4332] border border-emerald-200 rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#2d6a4f]" /> Ekspor CSV
          </button>

          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1b4332] hover:bg-[#081c15] text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-[#d4af37]" /> Tambah Jurnal
          </button>
        </div>
      </div>

      {/* Member Tabs Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#081c15] flex items-center gap-1.5">
            <User className="w-4 h-4 text-[#2d6a4f]" />
            Pilih Tabel Matriks Mahasiswa:
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Klik nama anggota untuk melihat matriks & research gap spesifik
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-[#1b4332] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Semua Matriks Kelompok</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-white/20 rounded font-mono">
              {literatures.length}
            </span>
          </button>

          {members.map((m) => {
            const count = literatures.filter((l) => l.relevanceForUserId === m.id || l.createdById === m.uid || l.relevanceForUserId === m.uid).length;
            const isMe = m.uid === currentUser?.uid || m.id === currentUser?.uid;

            return (
              <button
                key={m.id || m.uid}
                onClick={() => setActiveTab(m.id || m.uid)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
                  activeTab === (m.id || m.uid)
                    ? 'bg-[#2d6a4f] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Matriks {m.displayName}</span>
                {isMe && <span className="text-[10px] bg-[#d4af37] text-[#081c15] px-1.5 rounded font-bold">Saya</span>}
                <span className="px-1.5 py-0.2 text-[10px] bg-black/10 rounded font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Member Header Card (If viewing a specific member tab) */}
      {selectedMemberObj && (
        <div className="bg-gradient-to-r from-emerald-900 to-[#1b4332] p-5 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-700">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-lg text-white">
                Tabel Matriks & Research Gap: {selectedMemberObj.displayName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#d4af37] text-[#081c15]">
                {selectedMemberObj.role}
              </span>
            </div>
            <p className="text-xs text-emerald-100 line-clamp-1 italic">
              Judul Penelitian: &ldquo;{selectedMemberObj.researchTitleApproved || selectedMemberObj.researchTitleTemp || 'Draft'}&rdquo;
            </p>
          </div>

          <button
            onClick={() => openCreateModal(selectedMemberObj.id || selectedMemberObj.uid)}
            className="px-3.5 py-2 bg-[#d4af37] hover:bg-amber-400 text-[#081c15] font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition shadow-2xs"
          >
            <Plus className="w-4 h-4" /> Tambah Jurnal untuk {selectedMemberObj.displayName}
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari kata kunci di judul, penulis, metode, atau research gap..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
          />
        </div>
      </div>

      {/* Literature Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLits.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">
              {activeTab === 'all'
                ? 'Belum ada referensi dalam matriks penelitian'
                : `Belum ada jurnal/research gap untuk ${selectedMemberObj?.displayName}`}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tambahkan publikasi ilmiah 2022–2026 untuk memetakan objek, metode, hasil, dan kebaruan (novelty) skripsi.
            </p>
            <button
              onClick={() => openCreateModal(activeTab !== 'all' ? activeTab : undefined)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1b4332] text-white rounded-xl text-xs font-semibold hover:bg-[#081c15]"
            >
              <Plus className="w-4 h-4 text-[#d4af37]" /> Tambah Referensi Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#081c15] text-white font-serif border-b border-[#1b4332]">
                  <th className="p-3.5 font-semibold w-48">Penulis & Tahun</th>
                  <th className="p-3.5 font-semibold min-w-[220px]">Judul & Publisher</th>
                  <th className="p-3.5 font-semibold w-40">Objek & Data</th>
                  <th className="p-3.5 font-semibold w-36">Metode</th>
                  <th className="p-3.5 font-semibold min-w-[220px]">Hasil & Research Gap</th>
                  <th className="p-3.5 font-semibold w-36">Pemilik Matriks</th>
                  <th className="p-3.5 font-semibold text-right w-20">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLits.map((item) => {
                  const relMember = members.find(
                    (m) => m.id === item.relevanceForUserId || m.uid === item.relevanceForUserId || m.uid === item.createdById
                  );
                  const isEditable =
                    item.createdById === currentUser?.uid ||
                    item.relevanceForUserId === currentUser?.uid ||
                    currentUserProfile?.role === 'Ketua Kelompok' ||
                    group?.creatorId === currentUser?.uid;

                  return (
                    <tr key={item.id} className="hover:bg-emerald-50/30 transition">
                      <td className="p-3.5 font-medium text-slate-900 align-top">
                        <div className="font-bold">{item.authors}</div>
                        <div className="text-[11px] font-mono font-bold text-[#2d6a4f]">{item.year}</div>
                      </td>

                      <td className="p-3.5 text-slate-800 align-top space-y-1">
                        <div className="font-semibold text-slate-900">{item.title}</div>
                        <div className="text-[11px] text-slate-500">{item.venue}</div>
                        {item.doiUrl && (
                          <a
                            href={item.doiUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline font-mono"
                          >
                            <ExternalLink className="w-3 h-3" /> DOI / URL
                          </a>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-700 align-top space-y-1">
                        <div>
                          <strong>Objek:</strong> {item.researchObject}
                        </div>
                        {item.datasetCharacteristics && (
                          <div className="text-[11px] text-slate-500">{item.datasetCharacteristics}</div>
                        )}
                      </td>

                      <td className="p-3.5 align-top">
                        <span className="font-mono text-[11px] font-bold text-[#1b4332] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 block">
                          {item.method}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-700 align-top space-y-1.5">
                        <div className="text-slate-800">
                          <strong>Hasil:</strong> {item.results}
                        </div>
                        <div className="text-amber-950 bg-amber-50 p-2 rounded-xl border border-amber-200 text-[11px] space-y-0.5">
                          <div className="font-bold text-amber-900 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" /> Research Gap / Novelty:
                          </div>
                          <div>{item.researchGap}</div>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-700 align-top">
                        <span className="text-[11px] font-semibold text-[#1b4332] block">
                          {relMember?.displayName || 'Seluruh Kelompok'}
                        </span>
                        <span className="text-[10px] text-slate-500">{relMember?.role || 'Kelompok'}</span>
                      </td>

                      <td className="p-3.5 align-top text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isEditable ? (
                            <>
                              <button
                                onClick={() => openEditModal(item)}
                                title="Edit jurnal"
                                className="p-1.5 text-slate-500 hover:text-[#1b4332] hover:bg-emerald-50 rounded-lg transition"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLit(item)}
                                title="Hapus jurnal"
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span
                              title={`Tabel matriks ini dikelola oleh ${relMember?.displayName || 'pemilik'}`}
                              className="p-1.5 text-slate-300"
                            >
                              <Lock className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Literature Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSaveLit}
            className="bg-white rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl border border-emerald-100 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#081c15]">
                {editingLit ? 'Edit Referensi Jurnal' : 'Tambah Referensi Jurnal & Research Gap'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama Penulis *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pratama, A. & Wijaya, B."
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tahun Publikasi *</label>
                <input
                  type="number"
                  required
                  min={2000}
                  max={2030}
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Judul Artikel Jurnal / Konferensi *</label>
              <input
                type="text"
                required
                placeholder="Judul lengkap artikel ilmiah"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama Jurnal / Publisher *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Jurnal Teknologi Informasi & Ilmu Komputer"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tautan DOI / URL Jurnal</label>
                <input
                  type="url"
                  placeholder="https://doi.org/10.1234/..."
                  value={doiUrl}
                  onChange={(e) => setDoiUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Objek & Data Penelitian *</label>
                <input
                  type="text"
                  required
                  placeholder="Objek dan karakteristik data yang digunakan"
                  value={researchObject}
                  onChange={(e) => setResearchObject(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Metode yang Digunakan *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: CNN, Naive Bayes, TOPSIS, etc"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Hasil Penelitian & Akurasi *</label>
              <textarea
                rows={2}
                required
                placeholder="Hasil utama dan performa yang dicapai..."
                value={results}
                onChange={(e) => setResults(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Research Gap / Novelty *</label>
              <textarea
                rows={2}
                required
                placeholder="Rincian celah penelitian (gap) yang akan diisi oleh penelitian Anda..."
                value={researchGap}
                onChange={(e) => setResearchGap(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tabel Matriks Milik Anggota *</label>
              <select
                value={relevanceForUserId}
                onChange={(e) => setRelevanceForUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              >
                <option value="all">Seluruh Kelompok</option>
                {members.map((m) => (
                  <option key={m.id || m.uid} value={m.id || m.uid}>
                    Matriks {m.displayName} ({m.role})
                  </option>
                ))}
              </select>
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
                Simpan ke Matriks
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
