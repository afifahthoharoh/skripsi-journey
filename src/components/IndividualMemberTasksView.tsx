import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { STAGES_LIST } from '../data/defaultChecklists';
import { TaskItem, TaskPriority, TaskStatus, UserProfile } from '../types/skripsi';
import { saveTask, deleteTask, logActivity } from '../services/firestoreService';
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  ExternalLink,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Lock,
  GraduationCap,
  Award,
  BookOpen,
  FileCheck,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface IndividualMemberTasksViewProps {
  memberId?: string;
  onSelectMemberId?: (id: string) => void;
}

export const IndividualMemberTasksView: React.FC<IndividualMemberTasksViewProps> = ({
  memberId: externalMemberId,
  onSelectMemberId,
}) => {
  const { group, tasks, members, currentUser, currentUserProfile } = useAuthGroup();

  // If no memberId passed, default to logged-in user's UID, or the first member
  const currentSelectedMemberId = externalMemberId || currentUser?.uid || members[0]?.id || '';

  const targetMember: UserProfile | undefined =
    members.find((m) => m.id === currentSelectedMemberId || m.uid === currentSelectedMemberId) ||
    currentUserProfile ||
    members[0];

  const isOwnProfile = currentUser?.uid === targetMember?.uid || currentUser?.uid === targetMember?.id;
  const isKetua = currentUserProfile?.role === 'Ketua Kelompok' || group?.creatorId === currentUser?.uid;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Modal Form State
  const [title, setTitle] = useState('');
  const [stage, setStage] = useState(STAGES_LIST[0].name);
  const [status, setStatus] = useState<TaskStatus>('Belum Dimulai');
  const [priority, setPriority] = useState<TaskPriority>('Sedang');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Target member's tasks
  const memberTasks = tasks.filter(
    (t) => t.assigneeId === targetMember?.id || t.assigneeId === targetMember?.uid
  );

  const completedCount = memberTasks.filter((t) => t.status === 'Selesai').length;
  const totalCount = memberTasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter tasks
  const filteredTasks = memberTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStage = selectedStage === 'all' || t.stage === selectedStage;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    return matchesSearch && matchesStage && matchesStatus;
  });

  const openCreateModal = (stageName?: string) => {
    if (!isOwnProfile && !isKetua) {
      alert(`Akses Ditolak: Anda hanya dapat menambahkan tugas untuk akun Anda sendiri (${currentUserProfile?.displayName}).`);
      return;
    }
    setEditingTask(null);
    setTitle('');
    setStage(stageName || (selectedStage !== 'all' ? selectedStage : STAGES_LIST[0].name));
    setStatus('Belum Dimulai');
    setPriority('Sedang');
    setStartDate('');
    setDeadline('');
    setDescription('');
    setEvidenceUrl('');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    if (!isOwnProfile && !isKetua) {
      alert(`Akses Ditolak: Hanya ${targetMember?.displayName} yang dapat mengedit tugas miliknya.`);
      return;
    }
    setEditingTask(task);
    setTitle(task.title);
    setStage(task.stage);
    setStatus(task.status);
    setPriority(task.priority);
    setStartDate(task.startDate || '');
    setDeadline(task.deadline || '');
    setDescription(task.description || '');
    setEvidenceUrl(task.evidenceUrl || '');
    setNotes(task.notes || '');
    setModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !title.trim() || !targetMember) return;

    const taskData: TaskItem = {
      id: editingTask ? editingTask.id : `task_${Date.now()}`,
      groupId: group.id,
      title,
      stage,
      assigneeId: targetMember.id || targetMember.uid,
      status,
      priority,
      startDate,
      deadline,
      description,
      evidenceUrl,
      notes,
      updatedAt: new Date().toISOString(),
      createdById: editingTask ? editingTask.createdById : currentUser?.uid,
    };

    await saveTask(group.id, taskData);
    await logActivity(
      group.id,
      currentUser?.displayName || 'Mahasiswa',
      currentUser?.uid || '',
      editingTask ? 'Edit Tugas Individu' : 'Tambah Tugas Individu',
      `Tugas "${title}" untuk ${targetMember.displayName} (${status})`
    );

    setModalOpen(false);
  };

  const handleDeleteTask = async (task: TaskItem) => {
    if (!group) return;
    if (!isOwnProfile && !isKetua) {
      alert(`Akses Ditolak: Hanya ${targetMember?.displayName} yang dapat menghapus tugas miliknya.`);
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus tugas "${task.title}"?`)) return;
    await deleteTask(group.id, task.id);
    await logActivity(
      group.id,
      currentUser?.displayName || 'Mahasiswa',
      currentUser?.uid || '',
      'Hapus Tugas Individu',
      `Menghapus tugas "${task.title}" milik ${targetMember?.displayName}`
    );
  };

  const handleQuickToggleStatus = async (task: TaskItem) => {
    if (!group) return;
    if (!isOwnProfile) {
      alert(`Akses Ditolak: Anda tidak dapat menceklis tugas milik ${targetMember?.displayName}. Setiap anggota wajib menceklis tugasnya masing-masing.`);
      return;
    }

    const nextStatus: TaskStatus = task.status === 'Selesai' ? 'Dikerjakan' : 'Selesai';
    const updatedTask = { ...task, status: nextStatus, updatedAt: new Date().toISOString() };
    await saveTask(group.id, updatedTask);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Switch Member Navigation Pills */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#2d6a4f]" />
          <div>
            <h2 className="font-serif font-bold text-sm text-[#081c15]">Pilih Lembar Tugas Individu Anggota</h2>
            <p className="text-[11px] text-slate-500">
              Setiap anggota bertanggung jawab atas 14 tahapan tugas mapping map skripsinya.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {members.map((m) => {
            const isSelected = (m.id || m.uid) === (targetMember?.id || targetMember?.uid);
            const isMe = m.uid === currentUser?.uid || m.id === currentUser?.uid;

            return (
              <button
                key={m.id || m.uid}
                onClick={() => onSelectMemberId && onSelectMemberId(m.id || m.uid)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#1b4332] text-white shadow-sm border border-[#1b4332]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{m.displayName}</span>
                {isMe && <span className="text-[10px] bg-[#d4af37] text-[#081c15] px-1.5 py-0.2 rounded font-bold">Saya</span>}
                <span className="text-[10px] opacity-80">({m.role})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Header Banner */}
      <div className="bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#40916c] p-6 sm:p-7 rounded-3xl text-white shadow-md relative overflow-hidden space-y-4">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-[#d4af37] text-white flex items-center justify-center font-serif font-bold text-2xl shadow-inner shrink-0">
              {targetMember?.displayName?.charAt(0) || 'M'}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif font-bold text-xl sm:text-2xl text-white">
                  Tugas Individu: {targetMember?.displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#d4af37] text-[#081c15]">
                  {targetMember?.role}
                </span>
                {isOwnProfile && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400 text-emerald-950 border border-emerald-300">
                    Akun Anda
                  </span>
                )}
              </div>

              <div className="text-xs text-emerald-100/90 flex flex-wrap items-center gap-3">
                <span>NPM: <strong className="font-mono">{targetMember?.nim || '—'}</strong></span>
                <span>•</span>
                <span>Email: {targetMember?.email || '—'}</span>
              </div>

              <p className="text-xs text-emerald-100 font-medium pt-1 max-w-2xl flex items-start gap-1.5">
                <BookOpen className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <span>
                  <strong>Judul Skripsi:</strong>{' '}
                  {targetMember?.researchTitleApproved || targetMember?.researchTitleTemp || 'Belum Diisi'}
                </span>
              </p>
            </div>
          </div>

          {/* Progress Gauge Card */}
          <div className="bg-white/10 backdrop-blur-md p-4.5 rounded-2xl border border-white/20 min-w-[200px] text-center space-y-2 shrink-0">
            <div className="text-[11px] font-bold text-emerald-200 tracking-wider uppercase">Progres Mapping Map</div>
            <div className="font-serif font-bold text-3xl text-[#d4af37]">{progressPercentage}%</div>
            <div className="text-xs font-semibold text-emerald-100">
              {completedCount} dari {totalCount} Tugas Selesai
            </div>
            <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#d4af37] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Ownership Notice Bar */}
        <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100">
          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <>
                <FileCheck className="w-4 h-4 text-emerald-300" />
                <span>Anda memiliki hak penuh untuk menceklis & memperbarui tugas di lembar ini.</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-300" />
                <span>Modul Pemantauan: Anda hanya melihat progres tugas milik <strong>{targetMember?.displayName}</strong> (Akses ceklis dikunci).</span>
              </>
            )}
          </div>

          {(isOwnProfile || isKetua) && (
            <button
              onClick={() => openCreateModal()}
              className="px-3.5 py-1.5 bg-[#d4af37] hover:bg-amber-400 text-[#081c15] rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" /> Tambah Tugas Baru
            </button>
          )}
        </div>
      </div>

      {/* Search and Stage Filter Controls */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#081c15]">
            <Filter className="w-4 h-4 text-[#2d6a4f]" /> Filter Tahap Mapping Map ({targetMember?.displayName})
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari tugas individu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
            />
          </div>

          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
          >
            <option value="all">Semua Tahap Mapping Map (A–N)</option>
            {STAGES_LIST.map((s) => (
              <option key={s.code} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
          >
            <option value="all">Semua Status Pengerjaan</option>
            <option value="Belum Dimulai">Belum Dimulai</option>
            <option value="Dikerjakan">Dikerjakan</option>
            <option value="Menunggu">Menunggu Bimbingan</option>
            <option value="Terhambat">Terhambat</option>
            <option value="Selesai">Selesai (ACC)</option>
          </select>
        </div>
      </div>

      {/* Tasks Grouped by 14 Stages or Filtered List */}
      <div className="space-y-4">
        <div className="text-xs font-semibold text-slate-500">
          Menampilkan {filteredTasks.length} tugas pengerjaan milik {targetMember?.displayName}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada tugas pengerjaan ditemukan</p>
            <p className="text-xs text-slate-500">Coba ubah kata kunci atau pilih filter tahap di atas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((t) => {
              const isDone = t.status === 'Selesai';

              return (
                <div
                  key={t.id}
                  className={`bg-white p-4.5 rounded-2xl border transition shadow-2xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3.5 max-w-2xl">
                    <button
                      onClick={() => handleQuickToggleStatus(t)}
                      title={
                        isOwnProfile
                          ? 'Klik untuk menandai selesai/dikerjakan'
                          : `Hanya ${targetMember?.displayName} yang dapat menceklis tugas ini`
                      }
                      className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        isDone
                          ? 'bg-[#2d6a4f] border-[#2d6a4f] text-white'
                          : isOwnProfile
                          ? 'border-slate-300 hover:border-[#2d6a4f]'
                          : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : !isOwnProfile ? (
                        <Lock className="w-3 h-3 text-slate-400" />
                      ) : null}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {t.stage.split('—')[0]}
                        </span>
                        <h4
                          className={`font-semibold text-sm text-slate-900 ${
                            isDone ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {t.title}
                        </h4>
                        {!isOwnProfile && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-slate-200">
                            <Lock className="w-2.5 h-2.5" /> Milik {targetMember?.displayName}
                          </span>
                        )}
                      </div>

                      {t.description && (
                        <p className="text-xs text-slate-600 line-clamp-2">{t.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          Penanggung Jawab: {targetMember?.displayName}
                        </span>

                        {t.deadline && (
                          <span className="flex items-center gap-1 font-mono font-semibold text-[#1b4332]">
                            <Calendar className="w-3 h-3 text-[#2d6a4f]" /> Deadline: {t.deadline}
                          </span>
                        )}

                        {t.evidenceUrl && (
                          <a
                            href={t.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="w-3 h-3" /> Naskah / Bukti Dokumen
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          t.priority === 'Tinggi'
                            ? 'bg-red-100 text-red-800'
                            : t.priority === 'Sedang'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.priority}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          t.status === 'Selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Dikerjakan'
                            ? 'bg-blue-100 text-blue-800'
                            : t.status === 'Terhambat'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isOwnProfile || isKetua ? (
                        <>
                          <button
                            onClick={() => openEditModal(t)}
                            title="Edit tugas"
                            className="p-1.5 text-slate-500 hover:text-[#1b4332] hover:bg-emerald-50 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(t)}
                            title="Hapus tugas"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span
                          title={`Hanya ${targetMember?.displayName} yang dapat mengedit tugas ini`}
                          className="p-1.5 text-slate-300 cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSaveTask}
            className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-emerald-100 my-8"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-[#081c15]">
                {editingTask ? 'Edit Tugas Individu' : `Tambah Tugas untuk ${targetMember?.displayName}`}
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
              <label className="text-xs font-semibold text-slate-700">Nama / Judul Tugas *</label>
              <input
                type="text"
                required
                placeholder="Misal: Menyusun landasan teori Bab II perancangan model"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tahap Mapping Map Skripsi *</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              >
                {STAGES_LIST.map((s) => (
                  <option key={s.code} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Status Tugas *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                >
                  <option value="Belum Dimulai">Belum Dimulai</option>
                  <option value="Dikerjakan">Dikerjakan</option>
                  <option value="Menunggu">Menunggu Bimbingan</option>
                  <option value="Terhambat">Terhambat</option>
                  <option value="Selesai">Selesai (ACC)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Prioritas *</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tanggal Mulai</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tautan Naskah / Bukti (Drive Docs)</label>
              <input
                type="url"
                placeholder="https://docs.google.com/..."
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Deskripsi / Catatan Tambahan</label>
              <textarea
                rows={2}
                placeholder="Rincian poin tugas atau kendala pengerjaan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="flex gap-2 pt-3">
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
                {editingTask ? 'Simpan Perubahan' : 'Simpan Tugas Individu'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
