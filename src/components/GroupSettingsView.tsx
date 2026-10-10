import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { saveGroupDetails, saveUserProfile, logActivity } from '../services/firestoreService';
import { Settings, Copy, Check, Users, Save, ShieldCheck, Download, Edit3, X } from 'lucide-react';

export const GroupSettingsView: React.FC = () => {
  const { group, members, tasks, supervisions, surveys, literatures, documents, currentUser } = useAuthGroup();

  const [copied, setCopied] = useState(false);
  const [groupName, setGroupName] = useState(group?.name || '');
  const [theme, setTheme] = useState(group?.theme || '');
  const [location, setLocation] = useState(group?.location || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Edit NIM Modal
  const [editingNimMemberId, setEditingNimMemberId] = useState<string | null>(null);
  const [nimInput, setNimInput] = useState('');

  const copyInviteCode = () => {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;
    await saveGroupDetails(group.id, {
      name: groupName,
      theme,
      location,
    });
    await logActivity(group.id, currentUser?.displayName || 'Mahasiswa', currentUser?.uid || '', 'Pengaturan Kelompok', 'Memperbarui informasi nama/tema kelompok');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveNim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !editingNimMemberId) return;
    const targetMember = members.find((m) => m.id === editingNimMemberId);
    if (!targetMember) return;

    await saveUserProfile(group.id, {
      ...targetMember,
      nim: nimInput,
    });
    setEditingNimMemberId(null);
  };

  const exportAllDataJson = () => {
    const backupData = {
      group,
      members,
      tasks,
      supervisions,
      surveys,
      literatures,
      documents,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Skripsi_Journey_Backup_${group?.name || 'Kelompok'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="font-serif font-bold text-2xl text-[#081c15] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#2d6a4f]" />
          Pengaturan & Anggota Kelompok
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Pengelolaan informasi kelompok, kode undangan 3 anggota, dan cadangan data.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" /> Pengaturan kelompok berhasil diperbarui!
        </div>
      )}

      {/* Invite Code Box */}
      <div className="bg-gradient-to-r from-[#081c15] to-[#1b4332] text-white p-6 rounded-2xl border border-[#2d6a4f] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">
            Kode Undangan Anggota Kelompok
          </span>
          <h3 className="font-serif font-bold text-lg text-white">
            Bagikan Kode Ini ke 2 Teman Sekelompokmu
          </h3>
          <p className="text-xs text-emerald-100/80">
            Maksimal 3 anggota aktif per kelompok skripsi.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-black/30 p-3 rounded-xl border border-white/10 shrink-0">
          <span className="font-mono text-2xl font-bold tracking-widest text-[#e6cb78]">
            {group?.inviteCode}
          </span>

          <button
            onClick={copyInviteCode}
            className="px-3 py-2 bg-[#d4af37] hover:bg-[#c59b27] text-[#081c15] font-bold rounded-lg text-xs transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Tersalin!' : 'Salin Kode'}
          </button>
        </div>
      </div>

      {/* Active 3 Members List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-[#081c15] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#2d6a4f]" />
            Anggota Aktif Kelompok ({members.length}/3)
          </h3>

          <span className="text-xs text-slate-500 font-medium">
            {members.length < 3 ? `Sisa kuota: ${3 - members.length} anggota` : 'Kelompok Penuh (3/3)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {members.map((m) => (
            <div key={m.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{m.displayName}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#c59b27] font-bold text-[10px]">
                  {m.role}
                </span>
              </div>

              <p className="text-slate-600">Email: {m.email}</p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                <span className="font-mono text-slate-700">NIM: {m.nim || 'Belum diisi'}</span>
                <button
                  onClick={() => {
                    setEditingNimMemberId(m.id);
                    setNimInput(m.nim || '');
                  }}
                  className="text-[#2d6a4f] font-semibold hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit NIM
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Group Info Form */}
      <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-serif font-bold text-base text-[#081c15]">Edit Informasi Kelompok</h3>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Nama Kelompok Skripsi *</label>
          <input
            type="text"
            required
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Tema Besar Penelitian *</label>
          <input
            type="text"
            required
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Lokasi / Mitra Penelitian *</label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-[#1b4332] hover:bg-[#081c15] text-white font-semibold rounded-xl text-xs shadow-xs transition flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-[#d4af37]" /> Simpan Pengaturan
        </button>
      </form>

      {/* Export Backup Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-serif font-bold text-base text-[#081c15] flex items-center gap-2">
          <Download className="w-4 h-4 text-[#2d6a4f]" /> Cadangan Data (Backup)
        </h3>
        <p className="text-xs text-slate-500">
          Unduh seluruh data kelompok (tugas, bimbingan, matriks jurnal, dan dokumen) dalam format JSON untuk arsip mandiri.
        </p>

        <button
          onClick={exportAllDataJson}
          className="px-4 py-2.5 bg-slate-100 hover:bg-emerald-50 text-[#1b4332] border border-slate-300 rounded-xl text-xs font-semibold transition flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-[#2d6a4f]" /> Unduh Cadangan JSON
        </button>
      </div>

      {/* Edit NIM Modal */}
      {editingNimMemberId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleSaveNim}
            className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-emerald-100"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-serif font-bold text-base text-[#081c15]">Update NIM Mahasiswa</h3>
              <button
                type="button"
                onClick={() => setEditingNimMemberId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">NIM Mahasiswa *</label>
              <input
                type="text"
                required
                value={nimInput}
                onChange={(e) => setNimInput(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingNimMemberId(null)}
                className="w-1/2 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 bg-[#1b4332] text-white rounded-xl text-xs font-semibold hover:bg-[#081c15]"
              >
                Simpan NIM
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
