import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { STAGES_LIST } from '../data/defaultChecklists';
import { TaskItem, TaskPriority, TaskStatus } from '../types/skripsi';
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
} from 'lucide-react';

export const ChecklistTasksView: React.FC = () => {
  const { group, tasks, members, currentUser } = useAuthGroup();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [stage, setStage] = useState(STAGES_LIST[0].name);
  const [assigneeId, setAssigneeId] = useState('all');
  const [status, setStatus] = useState<TaskStatus>('Belum Dimulai');
  const [priority, setPriority] = useState<TaskPriority>('Sedang');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setStage(selectedStage !== 'all' ? selectedStage : STAGES_LIST[0].name);
    setAssigneeId('all');
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
    setEditingTask(task);
    setTitle(task.title);
    setStage(task.stage);
    setAssigneeId(task.assigneeId);
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
    if (!group || !title.trim()) return;

    const taskData: TaskItem = {
      id: editingTask ? editingTask.id : `task_${Date.now()}`,
      groupId: group.id,
      title,
      stage,
      assigneeId,
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
      editingTask ? 'Edit Tugas' : 'Tambah Tugas',
      `Tugas "${title}" (${status})`
    );

    setModalOpen(false);
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!group || !confirm(`Apakah Anda yakin ingin menghapus tugas "${taskTitle}"?`)) return;
    await deleteTask(group.id, taskId);
    await logActivity(group.id, currentUser?.displayName || 'Mahasiswa', currentUser?.uid || '', 'Hapus Tugas', `Menghapus tugas "${taskTitle}"`);
  };

  const handleQuickToggleStatus = async (task: TaskItem) => {
    if (!group) return;
    const nextStatus: TaskStatus = task.status === 'Selesai' ? 'Dikerjakan' : 'Selesai';
    const updatedTask = { ...task, status: nextStatus, updatedAt: new Date().toISOString() };
    await saveTask(group.id, updatedTask);
  };

  // Filter logic
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStage = selectedStage === 'all' || t.stage === selectedStage;
    const matchesAssignee = selectedAssignee === 'all' || t.assigneeId === selectedAssignee;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    return matchesSearch && matchesStage && matchesAssignee && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-2xl text-[#081c15] flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-[#2d6a4f]" />
            Checklist Tugas Tahap A–N
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen tugas lengkap dengan status, penanggung jawab, deadline, dan bukti dokumen.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1b4332] hover:bg-[#081c15] text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" />
          Tambah Tugas Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#081c15]">
          <Filter className="w-4 h-4 text-[#2d6a4f]" /> Filter & Pencarian
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari nama tugas..."
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
            <option value="all">Semua Tahap (A–N)</option>
            {STAGES_LIST.map((s) => (
              <option key={s.code} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
          >
            <option value="all">Semua Penanggung Jawab</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.displayName} ({m.role})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
          >
            <option value="all">Semua Status</option>
            <option value="Belum Dimulai">Belum Dimulai</option>
            <option value="Dikerjakan">Dikerjakan</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Terhambat">Terhambat</option>
            <option value="Selesai">Selesai</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
          >
            <option value="all">Semua Prioritas</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-slate-500">
          Menampilkan {filteredTasks.length} dari {tasks.length} tugas
        </div>

        {filteredTasks.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada tugas ditemukan</p>
            <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau filter di atas.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((t) => {
              const assigneeMember = members.find((m) => m.id === t.assigneeId);
              const isDone = t.status === 'Selesai';

              return (
                <div
                  key={t.id}
                  className={`bg-white p-4 rounded-2xl border transition shadow-2xs hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3.5 max-w-2xl">
                    <button
                      onClick={() => handleQuickToggleStatus(t)}
                      className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        isDone
                          ? 'bg-[#2d6a4f] border-[#2d6a4f] text-white'
                          : 'border-slate-300 hover:border-[#2d6a4f]'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
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
                      </div>

                      {t.description && (
                        <p className="text-xs text-slate-600 line-clamp-2">{t.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {assigneeMember?.displayName || 'Semua Anggota'}
                        </span>

                        {t.deadline && (
                          <span className="flex items-center gap-1 font-mono font-semibold text-[#1b4332]">
                            <Calendar className="w-3 h-3 text-[#2d6a4f]" /> {t.deadline}
                          </span>
                        )}

                        {t.evidenceUrl && (
                          <a
                            href={t.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                          >
                            <ExternalLink className="w-3 h-3" /> Bukti Dokumen
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
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1.5 text-slate-500 hover:text-[#1b4332] hover:bg-emerald-50 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(t.id, t.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                {editingTask ? 'Edit Tugas Skripsi' : 'Tambah Tugas Baru'}
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
                placeholder="Misal: Observasi alur kerja sistem irigasi di lokasi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Tahap Skripsi *</label>
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

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Penanggung Jawab *</label>
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
                  <option value="Menunggu">Menunggu</option>
                  <option value="Terhambat">Terhambat</option>
                  <option value="Selesai">Selesai</option>
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
              <label className="text-xs font-semibold text-slate-700">Tautan Dokumen / Bukti (Google Drive)</label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Deskripsi / Catatan Tambahan</label>
              <textarea
                rows={2}
                placeholder="Catatan pengerjaan atau hasil yang diharapkan..."
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
                {editingTask ? 'Simpan Perubahan' : 'Tambah Tugas'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
