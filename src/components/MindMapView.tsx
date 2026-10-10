import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { STAGES_LIST } from '../data/defaultChecklists';
import { GitFork, List, LayoutGrid, CheckCircle2, Clock, AlertCircle, Plus, Calendar, User } from 'lucide-react';
import { TaskItem } from '../types/skripsi';
import { saveTask, logActivity } from '../services/firestoreService';

export const MindMapView: React.FC = () => {
  const { group, tasks, members, currentUser } = useAuthGroup();
  const [selectedStage, setSelectedStage] = useState<string | null>(STAGES_LIST[0].name);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const [modalOpen, setModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('all');

  // Map each stage to its tasks and calculate node status
  const getStageNodeStatus = (stageName: string) => {
    const stageTasks = tasks.filter((t) => t.stage === stageName);
    if (stageTasks.length === 0) return { status: 'Belum Dimulai', color: 'bg-slate-100 text-slate-600 border-slate-300' };
    const completed = stageTasks.filter((t) => t.status === 'Selesai').length;
    if (completed === stageTasks.length) return { status: 'Selesai', color: 'bg-emerald-100 text-emerald-800 border-emerald-400' };
    const blocked = stageTasks.some((t) => t.status === 'Terhambat');
    if (blocked) return { status: 'Terhambat', color: 'bg-red-100 text-red-800 border-red-400' };
    const inProgress = stageTasks.some((t) => t.status === 'Dikerjakan' || t.status === 'Menunggu');
    if (inProgress) return { status: 'Sedang Berjalan', color: 'bg-amber-100 text-amber-900 border-amber-400' };
    return { status: 'Belum Dimulai', color: 'bg-slate-100 text-slate-600 border-slate-300' };
  };

  const handleAddTaskToStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStage || !newTaskTitle.trim() || !group) return;
    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      groupId: group.id,
      title: newTaskTitle,
      stage: selectedStage,
      assigneeId: newTaskAssignee,
      status: 'Belum Dimulai',
      priority: 'Sedang',
      updatedAt: new Date().toISOString(),
      createdById: currentUser?.uid,
    };
    await saveTask(group.id, newTask);
    await logActivity(group.id, currentUser?.displayName || 'Mahasiswa', currentUser?.uid || '', 'Tambah Tugas Mind Map', `Tugas "${newTaskTitle}" ditambahkan di ${selectedStage}`);
    setNewTaskTitle('');
    setModalOpen(false);
  };

  const currentStageTasks = tasks.filter((t) => t.stage === selectedStage);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="font-serif font-bold text-2xl text-[#081c15] flex items-center gap-2">
            <GitFork className="w-6 h-6 text-[#2d6a4f]" />
            Mind Map Perjalanan Skripsi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Alur interaktif 14 Tahapan Utama Skripsi Teknik Informatika dari Persiapan hingga Penyerahan Naskah Final.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'map' ? 'bg-[#1b4332] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Visual Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'list' ? 'bg-[#1b4332] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" /> Tampilan Daftar (HP)
          </button>
        </div>
      </div>

      {/* Legend & Status Indicators */}
      <div className="flex flex-wrap items-center gap-3 text-xs bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-2xs">
        <span className="font-semibold text-slate-700">Status Tahap:</span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Selesai
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
          <Clock className="w-3.5 h-3.5 text-amber-600" /> Sedang Berjalan
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Terhambat
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
          Belum Dimulai
        </span>
      </div>

      {/* View Mode 1: Interactive Visual Flowchart */}
      {viewMode === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flowchart Nodes Tree (2 Spans) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STAGES_LIST.map((stage, idx) => {
                const nodeInfo = getStageNodeStatus(stage.name);
                const isSelected = selectedStage === stage.name;
                const stageTasksCount = tasks.filter((t) => t.stage === stage.name).length;
                const stageDoneCount = tasks.filter((t) => t.stage === stage.name && t.status === 'Selesai').length;

                return (
                  <div
                    key={stage.code}
                    onClick={() => setSelectedStage(stage.name)}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer relative overflow-hidden ${
                      nodeInfo.color
                    } ${
                      isSelected
                        ? 'ring-2 ring-[#d4af37] ring-offset-2 shadow-md bg-white'
                        : 'hover:border-[#2d6a4f]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/5 text-slate-700">
                        {stage.code}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 text-slate-800 border border-slate-200">
                        {nodeInfo.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 mt-2 line-clamp-2">
                      {stage.name.replace(/^TAHAP [A-N] — /, '')}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-1 mt-1">
                      {stage.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60">
                      <span className="text-slate-500 font-medium">
                        Tugas: {stageDoneCount}/{stageTasksCount}
                      </span>
                      <span className="text-[#2d6a4f] font-bold">
                        {stageTasksCount > 0 ? Math.round((stageDoneCount / stageTasksCount) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detail Drawer for Selected Stage */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 self-start sticky top-6">
            {selectedStage ? (
              <>
                <div className="space-y-1 pb-3 border-b border-slate-100">
                  <div className="text-[10px] font-bold text-[#d4af37] uppercase tracking-wider">
                    Detail Node Perjalanan
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#081c15]">{selectedStage}</h3>
                  <p className="text-xs text-slate-500">
                    {STAGES_LIST.find((s) => s.name === selectedStage)?.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">
                    Daftar Tugas ({currentStageTasks.length})
                  </h4>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#1b4332] hover:text-[#081c15] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah
                  </button>
                </div>

                {currentStageTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Belum ada tugas khusus pada node ini.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {currentStageTasks.map((t) => {
                      const assigneeMember = members.find((m) => m.id === t.assigneeId);
                      return (
                        <div
                          key={t.id}
                          className="p-3 bg-slate-50 hover:bg-emerald-50/40 rounded-xl border border-slate-200 space-y-1.5 transition text-xs"
                        >
                          <div className="font-semibold text-slate-900">{t.title}</div>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              {assigneeMember?.displayName || 'Semua Anggota'}
                            </span>
                            {t.deadline && (
                              <span className="flex items-center gap-1 font-mono font-bold text-[#1b4332]">
                                <Calendar className="w-3 h-3" /> {t.deadline}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                              {t.priority} Priority
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                t.status === 'Selesai'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : t.status === 'Dikerjakan'
                                  ? 'bg-blue-100 text-blue-800'
                                  : t.status === 'Terhambat'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {t.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-slate-400 italic">Pilih simpul/node pada mind map untuk melihat detail.</p>
            )}
          </div>
        </div>
      )}

      {/* View Mode 2: List View for Mobile */}
      {viewMode === 'list' && (
        <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          {STAGES_LIST.map((stage, idx) => {
            const stageTasks = tasks.filter((t) => t.stage === stage.name);
            return (
              <div key={stage.code} className="p-4 rounded-xl border border-slate-200 space-y-2 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-[#081c15]">{stage.name}</div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {stageTasks.filter((t) => t.status === 'Selesai').length} / {stageTasks.length} Selesai
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{stage.description}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {modalOpen && selectedStage && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <form
            onSubmit={handleAddTaskToStage}
            className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-emerald-100"
          >
            <h3 className="font-serif font-bold text-lg text-[#081c15]">
              Tambah Tugas ke {selectedStage.split('—')[0]}
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nama Tugas *</label>
              <input
                type="text"
                required
                placeholder="Deskripsi singkat tugas"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#2d6a4f]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Penanggung Jawab *</label>
              <select
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
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

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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
    </div>
  );
};
