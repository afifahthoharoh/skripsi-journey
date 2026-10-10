import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { SurveyItem } from '../types/skripsi';
import { saveSurveyItem, deleteSurveyItem, logActivity } from '../services/firestoreService';
import { MapPin, Plus, Search, Calendar, User, ExternalLink, Trash2, Edit3, X, CheckCircle, ShieldAlert } from 'lucide-react';

export const FieldSurveyView: React.FC = () => {
  const { group, surveys, members, currentUser } = useAuthGroup();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<SurveyItem | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState(group?.location || '');
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [processObserved, setProcessObserved] = useState('');
  const [problemsFound, setProblemsFound] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [availableData, setAvailableData] = useState('');
  const [dataPeriod, setDataPeriod] = useState('');
  const [dataCompleteness, setDataCompleteness] = useState('');
  const [dataPermissionStatus, setDataPermissionStatus] = useState('Diizinkan');
  const [accessConstraints, setAccessConstraints] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [followUpAssignee, setFollowUpAssignee] = useState('all');

  const openCreateModal = () => {
    setEditingSurvey(null);
    setDate(new Date().toISOString().split('T')[0]);
    setLocation(group?.location || '');
    setContactName('');
    setContactRole('');
    setProcessObserved('');
    setProblemsFound('');
    setEvidenceUrl('');
    setAvailableData('');
    setDataPeriod('');
    setDataCompleteness('');
    setDataPermissionStatus('Diizinkan');
    setAccessConstraints('');
    setConclusion('');
    setFollowUpAssignee('all');
    setModalOpen(true);
  };

  const openEditModal = (s: SurveyItem) => {
    setEditingSurvey(s);
    setDate(s.date);
    setLocation(s.location);
    setContactName(s.contactName);
    setContactRole(s.contactRole);
    setProcessObserved(s.processObserved);
    setProblemsFound(s.problemsFound);
    setEvidenceUrl(s.evidenceUrl || '');
    setAvailableData(s.availableData);
    setDataPeriod(s.dataPeriod);
    setDataCompleteness(s.dataCompleteness);
    setDataPermissionStatus(s.dataPermissionStatus);
    setAccessConstraints(s.accessConstraints);
    setConclusion(s.conclusion);
    setFollowUpAssignee(s.followUpAssignee);
    setModalOpen(true);
  };

  const handleSaveSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !location.trim()) return;

    const surveyData: SurveyItem = {
      id: editingSurvey ? editingSurvey.id : `survey_${Date.now()}`,
      groupId: group.id,
      date,
      location,
      contactName,
      contactRole,
      processObserved,
      problemsFound,
      evidenceUrl,
      availableData,
      dataPeriod,
      dataCompleteness,
      dataPermissionStatus,
      accessConstraints,
      conclusion,
      followUpAssignee,
      createdById: editingSurvey ? editingSurvey.createdById : currentUser?.uid || '',
      createdAt: editingSurvey ? editingSurvey.createdAt : new Date().toISOString(),
    };

    await saveSurveyItem(group.id, surveyData);
    await logActivity(
      group.id,
      currentUser?.displayName || 'Mahasiswa',
      currentUser?.uid || '',
      editingSurvey ? 'Edit Log Survei' : 'Tambah Log Survei',
      `Survei di ${location} (${date})`
    );
    setModalOpen(false);
  };

  const handleDeleteSurvey = async (id: string, loc: string) => {
    if (!group || !confirm(`Apakah Anda yakin ingin menghapus log survei di "${loc}"?`)) return;
    await deleteSurveyItem(group.id, id);
    await logActivity(group.id, currentUser?.displayName || 'Mahasiswa', currentUser?.uid || '', 'Hapus Survei', `Menghapus survei di ${loc}`);
  };

  const filteredSurveys = surveys.filter(
    (s) =>
      s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.problemsFound.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-2xl text-[#081c15] flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#2d6a4f]" />
            Log Survei Lapangan & Validasi Data
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan hasil observasi, wawancara narasumber, alur kerja, dan ketersediaan data riil.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1b4332] hover:bg-[#081c15] text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" /> Catat Hasil Survei
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari lokasi, nama narasumber, atau temuan masalah..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs focus:outline-none"
        />
      </div>

      {/* Survey History Cards */}
      <div className="space-y-4">
        {filteredSurveys.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada riwayat survei lapangan</p>
            <p className="text-xs text-slate-500">Klik tombol &ldquo;Catat Hasil Survei&rdquo; untuk menambahkan observasi pertama.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSurveys.map((s) => {
              const assignee = members.find((m) => m.id === s.followUpAssignee);
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#2d6a4f] flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {s.date}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-0.5">{s.location}</h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1 text-slate-500 hover:text-[#1b4332] rounded"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSurvey(s.id, s.location)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5">
                      <p>
                        <strong>Narasumber:</strong> {s.contactName} ({s.contactRole})
                      </p>
                      <p>
                        <strong>Proses Kerja:</strong> {s.processObserved}
                      </p>
                      <p className="text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        <strong>Masalah Ditemukan:</strong> {s.problemsFound}
                      </p>
                      <p>
                        <strong>Ketersediaan Data:</strong> {s.availableData} ({s.dataPeriod}) — {s.dataCompleteness}
                      </p>
                      <p className="text-[#1b4332] font-semibold">
                        <strong>Kesimpulan Survei:</strong> {s.conclusion}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100">
                    <span className="text-slate-500 flex items-center gap-1">
                      <User className="w-3 h-3" /> PJ: {assignee?.displayName || 'Semua Anggota'}
                    </span>

                    {s.evidenceUrl && (
                      <a
                        href={s.evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Bukti Observasi
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Survey Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSaveSurvey}
            className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-emerald-100 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#081c15]">
                {editingSurvey ? 'Edit Log Survei' : 'Catat Observasi Survei Lapangan'}
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
                <label className="text-xs font-semibold text-slate-700">Tanggal Kunjungan *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Lokasi / Mitra Survei *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nama Narasumber *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Bpk. Supriadi"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Jabatan / Peran Narasumber *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kepala Pengelola Irigasi / Petani"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Proses Kerja yang Diamati *</label>
              <textarea
                rows={2}
                required
                placeholder="Jelaskan alur operasional aktual di lokasi..."
                value={processObserved}
                onChange={(e) => setProcessObserved(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Masalah Nyata yang Ditemukan *</label>
              <textarea
                rows={2}
                required
                placeholder="Rincian kendala nyata yang dialami narasumber..."
                value={problemsFound}
                onChange={(e) => setProblemsFound(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Jenis Data yang Tersedia *</label>
                <input
                  type="text"
                  required
                  placeholder="Log cuaca, suhu, debit air, dll"
                  value={availableData}
                  onChange={(e) => setAvailableData(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Periode & Kelengkapan Data *</label>
                <input
                  type="text"
                  required
                  placeholder="2022-2026 (Cukup Lengkap)"
                  value={dataPeriod}
                  onChange={(e) => setDataPeriod(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Kesimpulan & Tindak Lanjut *</label>
              <input
                type="text"
                required
                placeholder="Kesimpulan hasil survei dan langkah berikutnya"
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tautan Bukti / Foto Observasi (Drive)</label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
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
                Simpan Log Survei
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
