import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { saveGroupDetails, saveUserProfile, removeMemberFromGroup, logActivity } from '../services/firestoreService';
import { Settings, Copy, Check, Users, Save, Download, Edit3, X, CheckCircle2, UserX, AlertTriangle, Search } from 'lucide-react';
import { UserProfile } from '../types/skripsi';

export const GroupSettingsView: React.FC = () => {
  const { group, members, tasks, supervisions, surveys, literatures, documents, currentUser } = useAuthGroup();

  const [copied, setCopied] = useState(false);
  const [groupName, setGroupName] = useState(group?.name || '');
  const [theme, setTheme] = useState(group?.theme || '');
  const [location, setLocation] = useState(group?.location || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Search query for Ketua Kelompok reset member feature
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Edit NIM Modal
  const [editingNimMemberId, setEditingNimMemberId] = useState<string | null>(null);
  const [nimInput, setNimInput] = useState('');

  // Delete/Remove Member Modal
  const [deletingMember, setDeletingMember] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isKetua = currentUser?.uid === group?.creatorId;

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

  const handleApproveMember = async (memberId: string, displayName: string) => {
    if (!group) return;
    const targetMember = members.find((m) => m.id === memberId);
    if (!targetMember) return;

    await saveUserProfile(group.id, {
      ...targetMember,
      approvalStatus: 'Disetujui Dosen',
    });
    await logActivity(group.id, currentUser?.displayName || 'Ketua', currentUser?.uid || '', 'ACC Anggota', `Ketua Kelompok menyetujui pendaftaran ${displayName}`);
  };

  const handleConfirmRemoveMember = async () => {
    if (!group || !deletingMember) return;
    setIsDeleting(true);
    try {
      await removeMemberFromGroup(
        group.id,
        deletingMember.id,
        deletingMember.uid,
        group.inviteCode,
        deletingMember.displayName
      );
      setDeletingMember(null);
    } catch (err) {
      console.error('Failed to remove member:', err);
    } finally {
      setIsDeleting(false);
    }
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
          Pengelolaan informasi kelompok, kode undangan 3 anggota, validasi/ACC Ketua, dan reset pendaftaran anggota.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" /> Pengaturan kelompok berhasil diperbarui!
        </div>
      )}

      {/* Invite Code Box */}
      <div className="bg-gradient-to-r from-[#2f3e33] to-[#3a5a40] text-white p-6 rounded-2xl border border-[#588157] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            Anggota Kelompok ({members.length}/3)
          </h3>

          <span className="text-xs text-slate-500 font-medium">
            {members.length < 3 ? `Sisa kuota: ${3 - members.length} anggota` : 'Kelompok Penuh (3/3)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {members.map((m) => {
            const isMemberACC = m.approvalStatus === 'Disetujui Dosen';
            const isSelfOrCreator = m.uid === group?.creatorId;

            return (
              <div key={m.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[140px]">{m.displayName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#c59b27] font-bold text-[10px]">
                      {m.role}
                    </span>
                  </div>

                  <p className="text-slate-600 truncate">Email: {m.email}</p>

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

                {/* ACC Status & Ketua Actions */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-medium">Status Validasi:</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isMemberACC ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isMemberACC ? 'Telah Di-ACC Ketua' : 'Menunggu ACC Ketua'}
                    </span>
                  </div>

                  {isKetua && !isSelfOrCreator && (
                    <div className="space-y-1.5 pt-1">
                      {!isMemberACC && (
                        <button
                          onClick={() => handleApproveMember(m.id, m.displayName)}
                          className="w-full py-1.5 bg-[#588157] hover:bg-[#3a5a40] text-white font-semibold rounded-lg text-xs transition flex items-center justify-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#d4af37]" /> Setujui & ACC Anggota
                        </button>
                      )}

                      <button
                        onClick={() => setDeletingMember(m)}
                        className="w-full py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg text-[11px] transition flex items-center justify-center gap-1 border border-red-200"
                      >
                        <UserX className="w-3.5 h-3.5 text-red-600" /> Hapus Data / Reset Pendaftaran
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ketua Kelompok Special Tools: Search & Remove Member by Email / NPM */}
      {isKetua && (
        <div className="bg-[#fff5f5] p-6 rounded-2xl border border-red-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-100 rounded-xl text-red-700">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-red-950">
                Pencarian & Reset Data Anggota Salah (Khusus Ketua)
              </h3>
              <p className="text-xs text-red-700">
                Cari anggota berdasarkan <strong>Email</strong> atau <strong>NPM / NIM</strong> untuk menghapus pendaftaran yang salah agar anggota tersebut bisa mencoba mendaftar ulang.
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Ketik Email atau NPM / NIM anggota yang ingin dihapus..."
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-red-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="space-y-2">
            {members
              .filter((m) => m.uid !== group?.creatorId)
              .filter((m) => {
                if (!memberSearchQuery.trim()) return true;
                const q = memberSearchQuery.toLowerCase().trim();
                return (
                  m.email.toLowerCase().includes(q) ||
                  m.nim.toLowerCase().includes(q) ||
                  m.displayName.toLowerCase().includes(q)
                );
              })
              .map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 bg-white rounded-xl border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">
                      {m.displayName} <span className="text-red-700 font-semibold">({m.role})</span>
                    </div>
                    <div className="text-slate-600">
                      Email: <span className="font-medium text-slate-900">{m.email}</span>
                    </div>
                    <div className="text-slate-600">
                      NPM / NIM: <span className="font-mono font-bold text-slate-900">{m.nim || 'Belum diisi'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setDeletingMember(m)}
                    className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <UserX className="w-4 h-4" /> Hapus Data / Reset Anggota
                  </button>
                </div>
              ))}

            {members.filter((m) => m.uid !== group?.creatorId).length === 0 && (
              <p className="text-xs text-slate-500 italic bg-white p-3 rounded-xl border border-slate-200">
                Belum ada anggota lain yang bergabung di kelompok ini.
              </p>
            )}
          </div>
        </div>
      )}

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
          className="px-5 py-2.5 bg-[#3a5a40] hover:bg-[#2f3e33] text-white font-semibold rounded-xl text-xs shadow-xs transition flex items-center gap-2"
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
                className="w-1/2 py-2 bg-[#3a5a40] text-white rounded-xl text-xs font-semibold hover:bg-[#2f3e33]"
              >
                Simpan NIM
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete / Reset Member Modal (Ketua Only) */}
      {deletingMember && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-red-200">
            <div className="flex items-center gap-3 text-red-700 border-b border-red-100 pb-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-red-900">Hapus Data Anggota</h3>
                <p className="text-xs text-red-700">Fitur Khusus Ketua Kelompok</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-red-50/50 p-3.5 rounded-xl border border-red-100">
              <p>
                <strong>Nama:</strong> {deletingMember.displayName}
              </p>
              <p>
                <strong>Email:</strong> {deletingMember.email}
              </p>
              <p>
                <strong>NIM:</strong> {deletingMember.nim || 'Belum diisi'}
              </p>
              <p className="text-[11px] text-red-800 font-semibold pt-1 border-t border-red-100">
                ⚠️ Menghapus data anggota ini akan mengosongkan kuota anggota, sehingga mahasiswa terkait dapat melakukan pendaftaran ulang dengan Email atau NIM yang benar.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingMember(null)}
                className="w-1/2 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmRemoveMember}
                className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Data Anggota'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
