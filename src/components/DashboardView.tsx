import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { saveTask, saveSupervisionLog, saveLiteratureItem, saveDocumentItem, saveUserProfile, logActivity } from '../services/firestoreService';
import { PWAInstallButton } from './PWAInstallButton';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Layers,
  Plus,
  BookOpen,
  MapPin,
  TrendingUp,
  Award,
  GraduationCap,
  Info,
  ChevronRight,
  FileText,
  Database,
  MessageSquare,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { TaskItem } from '../types/skripsi';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    group,
    members,
    tasks,
    supervisions,
    revisions,
    chapters,
    activities,
    currentUser,
  } = useAuthGroup();

  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskModal, setQuickTaskModal] = useState(false);

  // Ketua validation state
  const isKetua = currentUser?.uid === group?.creatorId;
  const pendingMembers = members.filter((m) => m.approvalStatus !== 'Disetujui Dosen' && m.uid !== group?.creatorId);

  const handleApproveMemberDirect = async (memberId: string, displayName: string) => {
    if (!group) return;
    const targetMember = members.find((m) => m.id === memberId);
    if (!targetMember) return;

    await saveUserProfile(group.id, {
      ...targetMember,
      approvalStatus: 'Disetujui Dosen',
    });
    await logActivity(
      group.id,
      currentUser?.displayName || 'Ketua',
      currentUser?.uid || '',
      'ACC Anggota',
      `Ketua Kelompok menyetujui pendaftaran ${displayName}`
    );
  };

  // Calculations derived from ACTUAL real data!
  const totalTasks = tasks.length || 1;
  const completedTasks = tasks.filter((t) => t.status === 'Selesai').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'Dikerjakan').length;
  const waitingTasks = tasks.filter((t) => t.status === 'Menunggu').length;
  const blockedTasks = tasks.filter((t) => t.status === 'Terhambat').length;
  const notStartedTasks = tasks.filter((t) => t.status === 'Belum Dimulai').length;

  const groupProgressPercent = Math.round((completedTasks / totalTasks) * 100);

  // Calculate student individual progress
  const getStudentProgress = (userId: string) => {
    const studentTasks = tasks.filter((t) => t.assigneeId === userId || t.assigneeId === 'all');
    if (studentTasks.length === 0) return 0;
    const studentDone = studentTasks.filter((t) => t.status === 'Selesai').length;
    return Math.round((studentDone / studentTasks.length) * 100);
  };

  // Upcoming deadlines (Tasks with deadline set & not completed)
  const nowStr = new Date().toISOString().split('T')[0];
  const upcomingTasks = tasks
    .filter((t) => t.deadline && t.status !== 'Selesai')
    .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))
    .slice(0, 5);

  const overdueTasks = tasks.filter((t) => t.deadline && t.deadline < nowStr && t.status !== 'Selesai');

  // Next supervision log
  const nextSupervision = supervisions
    .filter((s) => s.status !== 'Selesai & ACC')
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  // Pending revisions count
  const pendingRevisions = revisions.filter((r) => r.status !== 'Disetujui').length;

  // Bab I-V Completion Status
  const babChapters = ['Bab I', 'Bab II', 'Bab III', 'Bab IV', 'Bab V'] as const;
  const getChapterApprovedCount = (chapName: string) => {
    const totalSub = chapters.filter((c) => c.chapter === chapName).length || 1;
    const doneSub = chapters.filter((c) => c.chapter === chapName && c.status === 'Disetujui').length;
    return { doneSub, totalSub, percent: Math.round((doneSub / totalSub) * 100) };
  };

  const handleQuickAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim() || !group) return;
    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      groupId: group.id,
      title: quickTaskTitle,
      stage: group.activeStage || 'TAHAP A — PERSIAPAN',
      assigneeId: currentUser?.uid || 'all',
      status: 'Dikerjakan',
      priority: 'Sedang',
      updatedAt: new Date().toISOString(),
      createdById: currentUser?.uid,
    };
    await saveTask(group.id, newTask);
    await logActivity(group.id, currentUser?.displayName || 'Mahasiswa', currentUser?.uid || '', 'Tambah Tugas Cepat', `Menambahkan tugas "${quickTaskTitle}"`);
    setQuickTaskTitle('');
    setQuickTaskModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#081c15] via-[#1b4332] to-[#2d6a4f] rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-[#2d6a4f] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#e6cb78] rounded-full text-xs font-semibold">
                {group?.activeStage || 'TAHAP A — PERSIAPAN'}
              </span>
              <span className="px-3 py-1 bg-white/10 text-emerald-100 rounded-full text-xs font-medium">
                {members.length}/3 Anggota Aktif
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              {group?.name || 'Kelompok Skripsi'}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100/90 pt-1">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#d4af37]" />
                <span className="font-medium text-white">{group?.theme}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#d4af37]" />
                <span>{group?.location}</span>
              </div>
            </div>
          </div>

          {/* Group Overall Progress Circle/Badge */}
          <div className="bg-black/30 backdrop-blur-xs p-5 rounded-2xl border border-white/10 flex items-center gap-4 min-w-[220px]">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-emerald-950"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#d4af37]"
                  strokeDasharray={`${groupProgressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-bold text-sm text-white">{groupProgressPercent}%</span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-emerald-200 font-semibold">Progress Kelompok</span>
                <button
                  onClick={() => setShowFormulaInfo(true)}
                  className="text-emerald-300 hover:text-white"
                  title="Lihat Rumus Perhitungan"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-lg font-bold text-white mt-0.5">
                {completedTasks} / {totalTasks} Tugas
              </div>
              <p className="text-[10px] text-emerald-300">Tersimpan di Firestore</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formula Explanation Modal */}
      {showFormulaInfo && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-emerald-100">
            <h3 className="font-serif font-bold text-lg text-[#081c15] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2d6a4f]" />
              Rumus Perhitungan Progress
            </h3>
            <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p>
                <strong>Progress Kelompok (%) =</strong> (Jumlah Tugas Status &apos;Selesai&apos; ÷ Total Tugas Kelompok) × 100%
              </p>
              <p>
                <strong>Progress Mahasiswa (%) =</strong> (Tugas Mahasiswa &apos;Selesai&apos; ÷ Total Tugas Ditugaskan ke Mahasiswa) × 100%
              </p>
              <p className="text-[11px] text-slate-500 italic">
                *Hitungan dinamis berdasarkan data tugas aktual di database Cloud Firestore, bukan angka statis.
              </p>
            </div>
            <button
              onClick={() => setShowFormulaInfo(false)}
              className="w-full py-2.5 bg-[#1b4332] text-white font-semibold rounded-xl text-xs hover:bg-[#081c15]"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Ketua ACC Notification Banner (If pending members exist) */}
      {isKetua && pendingMembers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-100/60 p-4 sm:p-5 rounded-2xl border border-amber-300 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-200/80 rounded-xl text-amber-900 shrink-0">
                <UserCheck className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-amber-950">
                  {pendingMembers.length} Anggota Baru Meminta ACC Pendaftaran
                </h3>
                <p className="text-xs text-amber-800">
                  Validasi pendaftaran anggota cukup di-ACC 1x oleh akun Ketua Kelompok.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('settings')}
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-amber-900 underline hover:text-amber-950"
            >
              Kelola di Pengaturan <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {pendingMembers.map((pm) => (
              <div
                key={pm.id}
                className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between text-xs gap-2 shadow-2xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{pm.displayName}</div>
                  <div className="text-[11px] text-slate-500">
                    {pm.email} • NIM: {pm.nim || 'Draft'}
                  </div>
                </div>

                <button
                  onClick={() => handleApproveMemberDirect(pm.id, pm.displayName)}
                  className="px-3 py-1.5 bg-[#588157] hover:bg-[#3a5a40] text-white font-bold rounded-lg text-xs transition flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#d4af37]" /> ACC Anggota
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <PWAInstallButton compact={false} />

        <button
          onClick={() => setQuickTaskModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1b4332] hover:bg-[#081c15] text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-[#d4af37]" />
          Tambah Tugas Cepat
        </button>

        <button
          onClick={() => onNavigate('supervision')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 text-[#1b4332] border border-emerald-200 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <MessageSquare className="w-4 h-4 text-[#2d6a4f]" />
          Catat Bimbingan
        </button>

        <button
          onClick={() => onNavigate('literature')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 text-[#1b4332] border border-emerald-200 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <FileText className="w-4 h-4 text-[#2d6a4f]" />
          Tambah Jurnal
        </button>

        <button
          onClick={() => onNavigate('data_docs')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 text-[#1b4332] border border-emerald-200 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Database className="w-4 h-4 text-[#2d6a4f]" />
          Tambah Dokumen
        </button>
      </div>

      {/* Quick Add Task Modal */}
      {quickTaskModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleQuickAddTask}
            className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-emerald-100"
          >
            <h3 className="font-serif font-bold text-lg text-[#081c15]">Tambah Tugas Cepat</h3>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Judul Tugas *</label>
              <input
                type="text"
                required
                placeholder="Misal: Menyusun draf Latar Belakang Bab I"
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuickTaskModal(false)}
                className="w-1/2 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 bg-[#1b4332] text-white rounded-xl text-xs font-semibold hover:bg-[#081c15]"
              >
                Simpan Tugas
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3 Students Progress Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-[#081c15] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#2d6a4f]" />
            Progress 3 Mahasiswa Kelompok
          </h3>
          <button
            onClick={() => onNavigate('theme')}
            className="text-xs font-semibold text-[#2d6a4f] hover:underline flex items-center gap-1"
          >
            Lihat Judul & Matriks Pembagian <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {members.map((member, idx) => {
            const memberTasks = tasks.filter((t) => t.assigneeId === member.id || t.assigneeId === member.uid);
            const memberDone = memberTasks.filter((t) => t.status === 'Selesai').length;
            const memberTotal = memberTasks.length;
            const prog = memberTotal > 0 ? Math.round((memberDone / memberTotal) * 100) : 0;

            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-3 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#1b4332] font-bold flex items-center justify-center text-sm border border-emerald-200">
                        {member.displayName?.charAt(0) || `M${idx + 1}`}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 truncate max-w-[150px]">
                          {member.displayName}
                        </h4>
                        <p className="text-[11px] text-slate-500">NIM: {member.nim || '—'}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 text-[#c59b27] font-semibold text-[10px] border border-[#d4af37]/30 shrink-0">
                      {member.role}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-medium text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      &ldquo;{member.researchTitleApproved || member.researchTitleTemp || 'Judul penelitian belum ditentukan'}&rdquo;
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Progres Mapping Map</span>
                      <span className="text-[#1b4332]">{prog}% ({memberDone}/{memberTotal} Selesai)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#2d6a4f] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${prog}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('individual_task')}
                  className="w-full py-2 mt-2 bg-slate-50 hover:bg-emerald-50 text-[#1b4332] font-semibold rounded-xl text-xs border border-slate-200 hover:border-emerald-200 transition flex items-center justify-center gap-1"
                >
                  Pantau Tugas {member.displayName} &rarr;
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Status Overview Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Selesai
          </div>
          <div className="text-2xl font-bold text-slate-900">{completedTasks}</div>
          <p className="text-[10px] text-slate-500">Tugas diselesaikan</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold">
            <Clock className="w-4 h-4" /> Dikerjakan
          </div>
          <div className="text-2xl font-bold text-slate-900">{inProgressTasks}</div>
          <p className="text-[10px] text-slate-500">Dalam proses</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold">
            <Clock className="w-4 h-4" /> Menunggu
          </div>
          <div className="text-2xl font-bold text-slate-900">{waitingTasks}</div>
          <p className="text-[10px] text-slate-500">Menunggu ACC / Bimbingan</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-red-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4" /> Terhambat
          </div>
          <div className="text-2xl font-bold text-slate-900">{blockedTasks}</div>
          <p className="text-[10px] text-slate-500">Mengalami kendala</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
            <Layers className="w-4 h-4" /> Belum Dimulai
          </div>
          <div className="text-2xl font-bold text-slate-900">{notStartedTasks}</div>
          <p className="text-[10px] text-slate-500">Di antrean checklist</p>
        </div>
      </div>

      {/* Main Grid: Deadlines, Bimbingan, Bab I-V */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Deadlines & Bab I-V */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming & Overdue Tasks */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#081c15] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2d6a4f]" />
                Deadline Terdekat & Tugas Terlambat
              </h3>
              <button
                onClick={() => onNavigate('checklist')}
                className="text-xs font-semibold text-[#2d6a4f] hover:underline"
              >
                Buka Checklist Lengkap
              </button>
            </div>

            {overdueTasks.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-red-800 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  {overdueTasks.length} Tugas Terlambat Melampaui Deadline!
                </div>
                <div className="space-y-1">
                  {overdueTasks.map((t) => (
                    <div key={t.id} className="flex justify-between items-center text-xs text-red-900 bg-white p-2 rounded-lg border border-red-100">
                      <span className="font-medium truncate">{t.title}</span>
                      <span className="font-mono text-[11px] font-bold text-red-600">{t.deadline}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Belum ada deadline tugas terdekat yang diset. Atur tanggal di menu Checklist.
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200 transition text-xs"
                  >
                    <div className="space-y-0.5 max-w-[70%]">
                      <div className="font-semibold text-slate-900 truncate">{t.title}</div>
                      <div className="text-[11px] text-slate-500">{t.stage}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#1b4332] block">{t.deadline}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bab I-V Document Status Grid */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#081c15] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2d6a4f]" />
                Status Dokumen Bab I–V
              </h3>
              <button
                onClick={() => onNavigate('chapters')}
                className="text-xs font-semibold text-[#2d6a4f] hover:underline"
              >
                Detail Subbab
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {babChapters.map((chap) => {
                const { doneSub, totalSub, percent } = getChapterApprovedCount(chap);
                return (
                  <div key={chap} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-center">
                    <div className="font-bold text-xs text-slate-800">{chap}</div>
                    <div className="text-lg font-extrabold text-[#1b4332]">{percent}%</div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#2d6a4f] h-1.5 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500">{doneSub}/{totalSub} Subbab ACC</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Bimbingan, Sempro & Sidang, Recent Activity */}
        <div className="space-y-6">
          {/* Next Supervision Schedule */}
          <div className="bg-gradient-to-br from-emerald-50 to-amber-50/40 rounded-2xl p-5 border border-emerald-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#1b4332] font-serif font-bold text-sm">
              <MessageSquare className="w-4 h-4 text-[#d4af37]" />
              Jadwal Bimbingan Berikutnya
            </div>

            {nextSupervision ? (
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{nextSupervision.advisorName || 'Dosen Pembimbing'}</span>
                  <span className="font-mono text-[#2d6a4f]">{nextSupervision.date}</span>
                </div>
                <p className="text-slate-600 line-clamp-2"><strong>Topik:</strong> {nextSupervision.topic}</p>
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Status: {nextSupervision.status}</span>
                  <button onClick={() => onNavigate('supervision')} className="text-[#2d6a4f] font-semibold hover:underline">
                    Buka Log &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-600 italic py-2">
                Belum ada jadwal bimbingan terdekat yang dicatat.
              </div>
            )}
          </div>

          {/* Sempro & Sidang Readiness Cards */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#081c15] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#2d6a4f]" />
              Kesiapan Sempro & Sidang
            </h3>

            <div className="space-y-2.5">
              <div
                onClick={() => onNavigate('sempro')}
                className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-xl border border-slate-200 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-800">Seminar Proposal (Sempro)</div>
                  <div className="text-[11px] text-slate-500">Persyaratan draf Bab I–III & slide</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => onNavigate('sidang')}
                className="p-3 bg-slate-50 hover:bg-amber-50/50 rounded-xl border border-slate-200 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-800">Sidang Akhir Skripsi</div>
                  <div className="text-[11px] text-slate-500">Persyaratan Bab I–V & demo sistem</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>

              {pendingRevisions > 0 && (
                <div
                  onClick={() => onNavigate('revisions')}
                  className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    {pendingRevisions} Revisi Penguji Belum Selesai
                  </span>
                  <span className="text-[10px] underline font-bold">Perbaiki &rarr;</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-sm text-[#081c15]">Aktivitas Terbaru Anggota</h3>
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Belum ada aktivitas tercatat.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activities.slice(0, 6).map((act) => (
                  <div key={act.id} className="text-xs border-b border-slate-100 pb-2 space-y-0.5">
                    <div className="flex justify-between text-slate-900 font-medium">
                      <span>{act.actorName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(act.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{act.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
