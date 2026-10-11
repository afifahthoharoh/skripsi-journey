import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  LayoutDashboard,
  GitFork,
  CheckSquare,
  BookOpen,
  MapPin,
  FileText,
  Database,
  Layers,
  MessageSquare,
  Calendar,
  GraduationCap,
  Award,
  CheckCircle2,
  FolderCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Copy,
  Check,
  Users,
  User,
  ListTodo,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'mindmap'
  | 'individual_task'
  | 'checklist'
  | 'theme'
  | 'survey'
  | 'literature'
  | 'data_docs'
  | 'chapters'
  | 'supervision'
  | 'timeline'
  | 'sempro'
  | 'sidang'
  | 'revisions'
  | 'final_docs'
  | 'settings';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedMemberId?: string;
  setSelectedMemberId?: (id: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  selectedMemberId,
  setSelectedMemberId,
}) => {
  const { group, members, currentUser, currentUserProfile, logout } = useAuthGroup();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const sharedMenuItems = [
    { id: 'theme', label: 'Tema & Pembagian Judul', icon: BookOpen },
    { id: 'survey', label: 'Survei Lapangan Bersama', icon: MapPin },
    { id: 'literature', label: 'Penelitian Terdahulu (Matrix)', icon: FileText },
    { id: 'data_docs', label: 'Data & Dokumen Bersama', icon: Database },
    { id: 'chapters', label: 'Bab I–V Penulisan', icon: Layers },
    { id: 'supervision', label: 'Bimbingan & Revisi Dosen', icon: MessageSquare },
    { id: 'timeline', label: 'Timeline & Kalender', icon: Calendar },
    { id: 'sempro', label: 'Seminar Proposal', icon: GraduationCap },
    { id: 'sidang', label: 'Persiapan Sidang', icon: Award },
    { id: 'revisions', label: 'Revisi Penguji', icon: CheckCircle2 },
    { id: 'final_docs', label: 'Dokumen Final', icon: FolderCheck },
  ] as const;

  const copyInviteCode = () => {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <>
      {/* Top Bar for Mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#2f3e33] text-white flex items-center justify-between px-3 sm:px-4 z-40 border-b border-[#3a5a40] shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Buka Menu"
            className="p-2 rounded-xl bg-[#3a5a40] text-emerald-100 hover:bg-[#588157] active:scale-95 transition"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-sm tracking-wide text-white truncate max-w-[120px] sm:max-w-none">
              Skripsi Journey
            </span>
            <span className="text-[10px] bg-[#d4af37]/20 text-[#e6cb78] px-2 py-0.5 rounded-full font-semibold border border-[#d4af37]/30 shrink-0">
              Sage
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton compact={true} />

          {group?.inviteCode && (
            <button
              onClick={copyInviteCode}
              title="Salin Kode Undangan"
              className="flex items-center gap-1 text-[11px] font-mono bg-[#3a5a40] text-[#e6cb78] px-2 py-1.5 rounded-lg border border-[#d4af37]/30 active:scale-95 transition"
            >
              <span>{group.inviteCode}</span>
              {copiedCode ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3 text-slate-300" />}
            </button>
          )}
        </div>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar Container - Fully Responsive */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 max-w-[80vw] sm:max-w-[260px] lg:w-64 bg-[#2f3e33] text-slate-100 flex flex-col z-50 transition-transform duration-300 ease-in-out border-r border-[#3a5a40] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-[#3a5a40] bg-[#28352b]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#588157] text-[#d4af37] flex items-center justify-center font-serif font-bold text-lg shadow-inner border border-[#d4af37]/30 shrink-0">
                SJ
              </div>
              <div>
                <h1 className="font-serif font-bold text-base text-white leading-tight">Skripsi Journey</h1>
                <p className="text-[11px] text-[#a3b18a] font-sans">Research Tracker Sage</p>
              </div>
            </div>

            {/* Mobile Close Button in Sidebar Header */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 text-slate-300 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {group && (
            <div className="mt-3.5 p-2.5 bg-[#3a5a40]/80 rounded-xl border border-[#588157] space-y-1">
              <div className="text-xs font-semibold text-white truncate">{group.name}</div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span className="flex items-center gap-1 text-[#e9ece0]">
                  <Users className="w-3 h-3" /> {group.memberCount}/3 Anggota
                </span>
                <button
                  onClick={copyInviteCode}
                  title="Salin Kode Undangan"
                  className="font-mono bg-[#2f3e33] text-[#e6cb78] px-1.5 py-0.5 rounded border border-[#d4af37]/40 flex items-center gap-1 hover:bg-black active:scale-95 transition"
                >
                  {group.inviteCode}
                  {copiedCode ? <Check className="w-2.5 h-2.5 text-emerald-300" /> : <Copy className="w-2.5 h-2.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {/* Section 1: Dashboard & Mind Map */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-[#a3b18a] tracking-wider uppercase">
              Dashboard & Visual
            </div>

            <button
              onClick={() => {
                setActiveTab('dashboard');
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#588157] text-white shadow-md border-l-4 border-[#d4af37]'
                  : 'text-slate-200 hover:bg-[#3a5a40] hover:text-white'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeTab === 'dashboard' ? 'text-[#d4af37]' : 'text-[#a3b18a]'}`} />
              <span className="truncate">Dashboard Utama</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('mindmap');
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'mindmap'
                  ? 'bg-[#588157] text-white shadow-md border-l-4 border-[#d4af37]'
                  : 'text-slate-200 hover:bg-[#3a5a40] hover:text-white'
              }`}
            >
              <GitFork className={`w-4 h-4 shrink-0 ${activeTab === 'mindmap' ? 'text-[#d4af37]' : 'text-[#a3b18a]'}`} />
              <span className="truncate">Mind Map Perjalanan</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('checklist');
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'checklist'
                  ? 'bg-[#588157] text-white shadow-md border-l-4 border-[#d4af37]'
                  : 'text-slate-200 hover:bg-[#3a5a40] hover:text-white'
              }`}
            >
              <CheckSquare className={`w-4 h-4 shrink-0 ${activeTab === 'checklist' ? 'text-[#d4af37]' : 'text-[#a3b18a]'}`} />
              <span className="truncate">Checklist Semua Tugas</span>
            </button>
          </div>

          {/* Section 2: TUGAS INDIVIDU (Sesuai Nama Anggota) */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-[#e6cb78] tracking-wider uppercase flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>Tugas Individu (Mapping Map)</span>
            </div>

            <div className="bg-[#243126] p-1.5 rounded-2xl border border-[#3a5a40] space-y-1">
              {members.map((m) => {
                const isMe = m.uid === currentUser?.uid || m.id === currentUser?.uid;
                const isMemberSelected =
                  activeTab === 'individual_task' &&
                  (selectedMemberId === m.id || selectedMemberId === m.uid);

                return (
                  <button
                    key={m.id || m.uid}
                    onClick={() => {
                      if (setSelectedMemberId) setSelectedMemberId(m.id || m.uid);
                      setActiveTab('individual_task');
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                      isMemberSelected
                        ? 'bg-[#1b4332] text-white font-bold border-l-4 border-[#d4af37] shadow-sm'
                        : 'text-slate-200 hover:bg-[#3a5a40] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isMe ? 'bg-[#d4af37] text-[#081c15]' : 'bg-[#588157] text-white'
                      }`}>
                        {m.displayName?.charAt(0) || 'M'}
                      </div>
                      <span className="truncate text-left">
                        Tugas {m.displayName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isMe && (
                        <span className="text-[9px] bg-[#d4af37] text-[#081c15] font-extrabold px-1.5 py-0.2 rounded">
                          Saya
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {m.role === 'Ketua Kelompok' ? 'Ketua' : m.role}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: KEBUTUHAN BERSAMA KELOMPOK */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-bold text-[#a3b18a] tracking-wider uppercase flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#588157]" />
              <span>Kebutuhan Bersama Kelompok</span>
            </div>

            {sharedMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as ActiveTab);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#588157] text-white shadow-md border-l-4 border-[#d4af37]'
                      : 'text-slate-200 hover:bg-[#3a5a40] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#d4af37]' : 'text-[#a3b18a]'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section 4: PENGATURAN */}
          <div className="space-y-1 pt-2 border-t border-[#3a5a40]">
            <button
              onClick={() => {
                setActiveTab('settings');
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#588157] text-white shadow-md border-l-4 border-[#d4af37]'
                  : 'text-slate-200 hover:bg-[#3a5a40] hover:text-white'
              }`}
            >
              <Settings className={`w-4 h-4 shrink-0 ${activeTab === 'settings' ? 'text-[#d4af37]' : 'text-[#a3b18a]'}`} />
              <span className="truncate">Pengaturan Kelompok</span>
            </button>
          </div>
        </nav>

        {/* PWA Install Button Banner inside Sidebar */}
        <div className="px-3 py-2 border-t border-[#3a5a40]">
          <PWAInstallButton className="w-full justify-center" compact={false} />
        </div>

        {/* Footer User & Logout */}
        <div className="p-3.5 border-t border-[#3a5a40] bg-[#28352b] flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#588157] text-[#f4f6f0] flex items-center justify-center font-bold text-xs shrink-0">
              {currentUserProfile?.displayName?.charAt(0) || 'M'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">
                {currentUserProfile?.displayName || 'Mahasiswa'}
              </div>
              <div className="text-[10px] text-[#a3b18a] truncate">
                {currentUserProfile?.role || 'Anggota'}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            title="Keluar / Logout"
            className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
