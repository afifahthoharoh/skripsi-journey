import React, { useState } from 'react';
import { useAuthGroup } from '../context/AuthGroupContext';
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
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'mindmap'
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
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { group, currentUserProfile, logout } = useAuthGroup();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mindmap', label: 'Mind Map Perjalanan', icon: GitFork },
    { id: 'checklist', label: 'Checklist Tugas', icon: CheckSquare },
    { id: 'theme', label: 'Tema & Pembagian Judul', icon: BookOpen },
    { id: 'survey', label: 'Survei Lapangan', icon: MapPin },
    { id: 'literature', label: 'Penelitian Terdahulu', icon: FileText },
    { id: 'data_docs', label: 'Data & Dokumen', icon: Database },
    { id: 'chapters', label: 'Bab I–V', icon: Layers },
    { id: 'supervision', label: 'Bimbingan & Revisi', icon: MessageSquare },
    { id: 'timeline', label: 'Timeline & Kalender', icon: Calendar },
    { id: 'sempro', label: 'Seminar Proposal', icon: GraduationCap },
    { id: 'sidang', label: 'Persiapan Sidang', icon: Award },
    { id: 'revisions', label: 'Revisi Penguji', icon: CheckCircle2 },
    { id: 'final_docs', label: 'Dokumen Final', icon: FolderCheck },
    { id: 'settings', label: 'Pengaturan Kelompok', icon: Settings },
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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#2f3e33] text-white flex items-center justify-between px-4 z-40 border-b border-[#3a5a40]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-[#3a5a40] text-emerald-100 hover:bg-[#588157]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm tracking-wide text-white">Skripsi Journey</span>
            <span className="text-[10px] bg-[#d4af37]/20 text-[#e6cb78] px-2 py-0.5 rounded-full font-semibold border border-[#d4af37]/30">
              Sage Theme
            </span>
          </div>
        </div>

        {group?.inviteCode && (
          <button
            onClick={copyInviteCode}
            className="flex items-center gap-1 text-[11px] font-mono bg-[#3a5a40] text-[#e6cb78] px-2.5 py-1 rounded-md border border-[#d4af37]/30"
          >
            {group.inviteCode}
            {copiedCode ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3 text-slate-300" />}
          </button>
        )}
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-xs"
        />
      )}

      {/* Main Sidebar Container - Sage Green Aesthetic */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#2f3e33] text-slate-100 flex flex-col z-50 transition-transform duration-300 border-r border-[#3a5a40] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#3a5a40] bg-[#28352b]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#588157] text-[#d4af37] flex items-center justify-center font-serif font-bold text-lg shadow-inner border border-[#d4af37]/30">
              SJ
            </div>
            <div>
              <h1 className="font-serif font-bold text-base text-white leading-tight">Skripsi Journey</h1>
              <p className="text-[11px] text-[#a3b18a] font-sans">Research Tracker Sage Edition</p>
            </div>
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
                  className="font-mono bg-[#2f3e33] text-[#e6cb78] px-1.5 py-0.5 rounded border border-[#d4af37]/40 flex items-center gap-1 hover:bg-black transition"
                >
                  {group.inviteCode}
                  {copiedCode ? <Check className="w-2.5 h-2.5 text-emerald-300" /> : <Copy className="w-2.5 h-2.5" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as ActiveTab);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
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
        </nav>

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
