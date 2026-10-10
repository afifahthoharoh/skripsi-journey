import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { DocumentItem } from '../types/skripsi';
import { saveDocumentItem, deleteDocumentItem, logActivity } from '../services/firestoreService';
import { Database, Plus, Search, ExternalLink, Trash2, Edit3, X, FileText, Lock, Folder } from 'lucide-react';

export const ResearchDataDocsView: React.FC = () => {
  const { group, documents, members, currentUser } = useAuthGroup();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('Data Mentah');
  const [allowedAccess, setAllowedAccess] = useState<any>('Semua Anggota');
  const [docUrl, setDocUrl] = useState('');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingDoc(null);
    setTitle('');
    setCategory('Data Mentah');
    setAllowedAccess('Semua Anggota');
    setDocUrl('');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (d: DocumentItem) => {
    setEditingDoc(d);
    setTitle(d.title);
    setCategory(d.category);
    setAllowedAccess(d.allowedAccess);
    setDocUrl(d.docUrl);
    setNotes(d.notes || '');
    setModalOpen(true);
  };

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !title.trim() || !docUrl.trim()) return;

    const docData: DocumentItem = {
      id: editingDoc ? editingDoc.id : `doc_${Date.now()}`,
      groupId: group.id,
      title,
      category,
      ownerId: editingDoc ? editingDoc.ownerId : currentUser?.uid || '',
      ownerName: editingDoc ? editingDoc.ownerName : currentUser?.displayName || 'Mahasiswa',
      allowedAccess,
      docUrl,
      notes,
      updatedAt: new Date().toISOString(),
    };

    await saveDocumentItem(group.id, docData);
    await logActivity(
      group.id,
      currentUser?.displayName || 'Mahasiswa',
      currentUser?.uid || '',
      editingDoc ? 'Edit Dokumen' : 'Tambah Dokumen',
      `Dokumen "${title}" (${category})`
    );
    setModalOpen(false);
  };

  const handleDeleteDoc = async (id: string, t: string) => {
    if (!group || !confirm(`Hapus item dokumen "${t}"?`)) return;
    await deleteDocumentItem(group.id, id);
    await logActivity(group.id, currentUser?.displayName || 'Mahasiswa', currentUser?.uid || '', 'Hapus Dokumen', `Menghapus item "${t}"`);
  };

  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.notes && d.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-2xl text-[#081c15] flex items-center gap-2">
            <Database className="w-6 h-6 text-[#2d6a4f]" />
            Katalog Data Penelitian & Dokumen
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Penyimpanan tautan terstruktur untuk Data Mentah, Data Hasil Pembersihan, Dokumen Laporan, dan File Evaluasi.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1b4332] hover:bg-[#081c15] text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" /> Tambah Dokumen / Data
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama dokumen atau dataset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
        >
          <option value="all">Semua Kategori</option>
          <option value="Data Mentah">Data Mentah</option>
          <option value="Data Hasil Pembersihan">Data Hasil Pembersihan</option>
          <option value="Dokumen Penelitian">Dokumen Penelitian</option>
          <option value="Hasil Evaluasi">Hasil Evaluasi</option>
          <option value="Naskah Final">Naskah Final</option>
        </select>
      </div>

      {/* Document Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <Folder className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada item dokumen/dataset</p>
            <p className="text-xs text-slate-500">Klik &ldquo;Tambah Dokumen / Data&rdquo; untuk menyimpan tautan Google Drive.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {doc.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(doc)} className="p-1 text-slate-500 hover:text-[#1b4332] rounded">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteDoc(doc.id, doc.title)} className="p-1 text-slate-400 hover:text-red-600 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-sm text-slate-900">{doc.title}</h4>
                {doc.notes && <p className="text-xs text-slate-600 line-clamp-2">{doc.notes}</p>}
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Pemilik: <strong>{doc.ownerName}</strong></span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> {doc.allowedAccess}
                  </span>
                </div>

                <a
                  href={doc.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-[#1b4332] hover:bg-[#081c15] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" /> Buka di Google Drive
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Document Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSaveDoc}
            className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-emerald-100 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#081c15]">
                {editingDoc ? 'Edit Item Dokumen' : 'Tambah Dokumen / Dataset Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Dokumen / Dataset *</label>
              <input
                type="text"
                required
                placeholder="Misal: Dataset Curah Hujan Sawah 2022-2026 (Cleaned)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Kategori Item *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              >
                <option value="Data Mentah">Data Mentah</option>
                <option value="Data Hasil Pembersihan">Data Hasil Pembersihan</option>
                <option value="Dokumen Penelitian">Dokumen Penelitian</option>
                <option value="Hasil Evaluasi">Hasil Evaluasi</option>
                <option value="Naskah Final">Naskah Final</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tautan Google Drive / Cloud *</label>
              <input
                type="url"
                required
                placeholder="https://drive.google.com/..."
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Akses Izin *</label>
              <select
                value={allowedAccess}
                onChange={(e) => setAllowedAccess(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              >
                <option value="Semua Anggota">Semua Anggota Kelompok</option>
                <option value="Hanya Pemilik">Hanya Pemilik</option>
                <option value="Pembimbing & Kelompok">Pembimbing & Kelompok</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Catatan / Deskripsi</label>
              <textarea
                rows={2}
                placeholder="Keterangan format data, jumlah baris, versi, dll"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                Simpan Item Dokumen
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
