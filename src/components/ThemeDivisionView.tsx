import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { RECOMMENDED_THEMES } from '../data/defaultChecklists';
import { saveGroupDetails, saveUserProfile, logActivity } from '../services/firestoreService';
import { BookOpen, MapPin, Database, ShieldCheck, MessageSquare, Edit3, CheckCircle, Sparkles, User, Save, X } from 'lucide-react';
import { UserProfile } from '../types/skripsi';

export const ThemeDivisionView: React.FC = () => {
  const { group, members, currentUser } = useAuthGroup();

  const [editingGroupInfo, setEditingGroupInfo] = useState(false);
  const [themeName, setThemeName] = useState(group?.theme || '');
  const [themeDesc, setThemeDesc] = useState(group?.themeDescription || '');
  const [locationName, setLocationName] = useState(group?.location || '');
  const [sharedData, setSharedData] = useState(group?.sharedDataSources || '');
  const [dataPerms, setDataPerms] = useState(group?.dataPermissions || '');
  const [advisorNotes, setAdvisorNotes] = useState(group?.advisorNotes || '');

  // Student Edit Modal
  const [editingMember, setEditingMember] = useState<UserProfile | null>(null);
  const [titleTemp, setTitleTemp] = useState('');
  const [titleApproved, setTitleApproved] = useState('');
  const [background, setBackground] = useState('');
  const [problem, setProblem] = useState('');
  const [objectives, setObjectives] = useState('');
  const [limitations, setLimitations] = useState('');
  const [method, setMethod] = useState('');
  const [dataset, setDataset] = useState('');
  const [contribution, setContribution] = useState('');
  const [indicators, setIndicators] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<any>('Draft');

  const handleSaveGroupTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;
    await saveGroupDetails(group.id, {
      theme: themeName,
      themeDescription: themeDesc,
      location: locationName,
      sharedDataSources: sharedData,
      dataPermissions: dataPerms,
      advisorNotes,
    });
    await logActivity(group.id, currentUser?.displayName || 'Mahasiswa', currentUser?.uid || '', 'Update Tema Kelompok', `Memperbarui tema besar "${themeName}"`);
    setEditingGroupInfo(false);
  };

  const openMemberEditModal = (m: UserProfile) => {
    setEditingMember(m);
    setTitleTemp(m.researchTitleTemp || '');
    setTitleApproved(m.researchTitleApproved || '');
    setBackground(m.background || '');
    setProblem(m.problemStatement || '');
    setObjectives(m.objectives || '');
    setLimitations(m.limitations || '');
    setMethod(m.method || '');
    setDataset(m.dataset || '');
    setContribution(m.expectedContribution || '');
    setIndicators(m.evaluationIndicators || '');
    setApprovalStatus(m.approvalStatus || 'Draft');
  };

  const handleSaveMemberResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !editingMember) return;

    const updatedProfile: UserProfile = {
      ...editingMember,
      researchTitleTemp: titleTemp,
      researchTitleApproved: titleApproved,
      background,
      problemStatement: problem,
      objectives,
      limitations,
      method,
      dataset,
      expectedContribution: contribution,
      evaluationIndicators: indicators,
      approvalStatus,
    };

    await saveUserProfile(group.id, updatedProfile);
    await logActivity(
      group.id,
      currentUser?.displayName || 'Mahasiswa',
      currentUser?.uid || '',
      'Update Judul & Rumusan',
      `Memperbarui rencana penelitian untuk ${editingMember.displayName}`
    );
    setEditingMember(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-2xl text-[#081c15] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#2d6a4f]" />
            Tema & Pembagian Judul Penelitian
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Satu tema besar kelompok dengan 3 penelitian terpisah yang saling melengkapi.
          </p>
        </div>

        <button
          onClick={() => {
            setThemeName(group?.theme || '');
            setThemeDesc(group?.themeDescription || '');
            setLocationName(group?.location || '');
            setSharedData(group?.sharedDataSources || '');
            setDataPerms(group?.dataPermissions || '');
            setAdvisorNotes(group?.advisorNotes || '');
            setEditingGroupInfo(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1b4332] hover:bg-[#081c15] text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Edit3 className="w-4 h-4 text-[#d4af37]" /> Edit Ruang Kerja Tema
        </button>
      </div>

      {/* Main Group Workspace Theme Card */}
      <div className="bg-gradient-to-br from-white via-emerald-50/20 to-amber-50/20 p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
        <div className="flex items-start justify-between border-b border-emerald-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">
              Tema Besar Penelitian Kelompok
            </span>
            <h2 className="font-serif font-bold text-xl text-[#081c15] mt-0.5">
              {group?.theme}
            </h2>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-[#1b4332] rounded-full text-xs font-semibold border border-emerald-200">
            {group?.name}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {group?.themeDescription || 'Belum ada deskripsi tema besar.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-emerald-800">
              <MapPin className="w-4 h-4" /> Lokasi Penelitian
            </div>
            <p className="text-slate-600">{group?.location || 'Belum diset'}</p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-emerald-800">
              <Database className="w-4 h-4" /> Sumber Data Bersama
            </div>
            <p className="text-slate-600 line-clamp-2">{group?.sharedDataSources || 'Belum diset'}</p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-emerald-800">
              <ShieldCheck className="w-4 h-4" /> Izin & Kerahasiaan
            </div>
            <p className="text-slate-600 line-clamp-2">{group?.dataPermissions || 'Belum diset'}</p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 text-emerald-800">
              <MessageSquare className="w-4 h-4" /> Catatan Dosen
            </div>
            <p className="text-slate-600 line-clamp-2">{group?.advisorNotes || 'Belum ada catatan'}</p>
          </div>
        </div>
      </div>

      {/* Recommended Themes Brainstorming Banner */}
      <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 space-y-3">
        <div className="flex items-center gap-2 font-serif font-bold text-sm text-amber-900">
          <Sparkles className="w-4 h-4 text-[#d4af37]" />
          Rekomendasi Tema Besar Penelitian Teknik Informatika
        </div>
        <p className="text-xs text-slate-600">
          Gunakan sebagai acuan ide perumusan 3 judul kelompok yang relevan dan saling mendukung:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {RECOMMENDED_THEMES.map((item, idx) => (
            <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-[#1b4332]">{item.title}</div>
              <p className="text-slate-500 text-[11px] leading-snug">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Student Separate Research Cards */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-lg text-[#081c15]">
          3 Kartu Penelitian Mahasiswa
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {members.map((member, idx) => {
            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Student Badge & Role */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#1b4332] font-bold flex items-center justify-center text-xs border border-emerald-200">
                        {member.displayName?.charAt(0) || `M${idx + 1}`}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{member.displayName}</h4>
                        <span className="text-[11px] text-slate-500">{member.nim || 'NIM belum diisi'}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/20 text-[#c59b27] font-bold text-[10px] border border-[#d4af37]/30">
                      {member.role}
                    </span>
                  </div>

                  {/* Title Section */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-500">Judul Penelitian</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          member.approvalStatus === 'Disetujui Dosen'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {member.approvalStatus || 'Draft'}
                      </span>
                    </div>

                    <div className="font-serif font-bold text-xs text-[#081c15] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {member.researchTitleApproved || member.researchTitleTemp || 'Judul penelitian belum diisi.'}
                    </div>
                  </div>

                  {/* Key Components: Problem, Method, Dataset, Contribution */}
                  <div className="space-y-2 text-xs pt-1">
                    <div>
                      <span className="font-bold text-slate-700">Rumusan Masalah:</span>
                      <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">
                        {member.problemStatement || 'Belum dirumuskan.'}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700">Metode & Algoritma:</span>
                      <p className="text-slate-600 text-[11px] line-clamp-1 mt-0.5">
                        {member.method || 'Belum ditentukan.'}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700">Target Kontribusi:</span>
                      <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">
                        {member.expectedContribution || 'Belum diisi.'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openMemberEditModal(member)}
                  className="w-full py-2 bg-slate-100 hover:bg-[#1b4332] text-slate-700 hover:text-white font-semibold rounded-xl text-xs transition border border-slate-200 mt-2"
                >
                  Edit Detail Rencana Penelitian &rarr;
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Group Theme Workspace Modal */}
      {editingGroupInfo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSaveGroupTheme}
            className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-emerald-100 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#081c15]">Edit Ruang Kerja Tema Kelompok</h3>
              <button
                type="button"
                onClick={() => setEditingGroupInfo(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tema Besar Penelitian *</label>
              <input
                type="text"
                required
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Deskripsi & Rationale Pemilihan Tema</label>
              <textarea
                rows={3}
                value={themeDesc}
                onChange={(e) => setThemeDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Lokasi / Objek Penelitian *</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Sumber Data Bersama</label>
              <input
                type="text"
                value={sharedData}
                onChange={(e) => setSharedData(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Izin & Batasan Akses Data</label>
              <input
                type="text"
                value={dataPerms}
                onChange={(e) => setDataPerms(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Catatan Konsultasi Dosen</label>
              <textarea
                rows={2}
                value={advisorNotes}
                onChange={(e) => setAdvisorNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingGroupInfo(false)}
                className="w-1/3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-[#1b4332] text-white rounded-xl text-xs font-semibold hover:bg-[#081c15]"
              >
                Simpan Ruang Kerja
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Student Research Detail Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSaveMemberResearch}
            className="bg-white rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl border border-emerald-100 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#081c15]">
                  Edit Penelitian: {editingMember.displayName}
                </h3>
                <span className="text-xs text-slate-500">{editingMember.role}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Judul Penelitian Sementara (Draft) *</label>
              <input
                type="text"
                required
                value={titleTemp}
                onChange={(e) => setTitleTemp(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Judul yang Disetujui Dosen (Jika Ada)</label>
              <input
                type="text"
                value={titleApproved}
                onChange={(e) => setTitleApproved(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Rumusan Masalah *</label>
                <textarea
                  rows={2}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tujuan & Batasan Penelitian *</label>
                <textarea
                  rows={2}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Metode & Algoritma *</label>
                <input
                  type="text"
                  placeholder="Misal: CNN / Random Forest / SAW / TOPSIS"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Status Persetujuan Dosen *</label>
                <select
                  value={approvalStatus}
                  onChange={(e) => setApprovalStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                >
                  <option value="Draft">Draft</option>
                  <option value="Diusulkan">Diusulkan</option>
                  <option value="Perlu Revisi">Perlu Revisi</option>
                  <option value="Disetujui Dosen">Disetujui Dosen</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Target Kontribusi Penelitian *</label>
              <textarea
                rows={2}
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="w-1/3 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 bg-[#1b4332] text-white rounded-xl text-xs font-semibold hover:bg-[#081c15]"
              >
                Simpan Kartu Penelitian
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
