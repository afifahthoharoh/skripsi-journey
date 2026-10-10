export type TaskStatus = 'Belum Dimulai' | 'Dikerjakan' | 'Menunggu' | 'Terhambat' | 'Selesai';
export type TaskPriority = 'Rendah' | 'Sedang' | 'Tinggi';

export type ChapterWritingStatus = 'Belum Ditulis' | 'Sedang Ditulis' | 'Menunggu Bimbingan' | 'Perlu Revisi' | 'Disetujui';

export type MemberRole = 'Ketua Kelompok' | 'Anggota 1' | 'Anggota 2';

export interface Group {
  id: string;
  name: string;
  theme: string;
  themeDescription: string;
  location: string;
  sharedDataSources: string;
  dataPermissions: string;
  advisorNotes: string;
  inviteCode: string;
  creatorId: string;
  activeStage: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  groupId: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  nim: string;
  role: MemberRole;
  researchTitleTemp: string;
  researchTitleApproved: string;
  background: string;
  problemStatement: string;
  objectives: string;
  limitations: string;
  method: string;
  dataset: string;
  expectedContribution: string;
  evaluationIndicators: string;
  approvalStatus: 'Draft' | 'Diusulkan' | 'Perlu Revisi' | 'Disetujui Dosen';
  joinedAt: string;
}

export interface TaskItem {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  stage: string; // E.g., 'TAHAP A — PERSIAPAN'
  assigneeId: string; // userId or 'all'
  assigneeName?: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate?: string;
  deadline?: string;
  notes?: string;
  evidenceUrl?: string;
  updatedAt: string;
  createdById?: string;
}

export interface SurveyItem {
  id: string;
  groupId: string;
  date: string;
  location: string;
  contactName: string;
  contactRole: string;
  processObserved: string;
  problemsFound: string;
  evidenceUrl?: string;
  availableData: string;
  dataPeriod: string;
  dataCompleteness: string;
  dataPermissionStatus: string;
  accessConstraints: string;
  conclusion: string;
  followUpAssignee: string;
  createdById: string;
  createdAt: string;
}

export interface LiteratureItem {
  id: string;
  groupId: string;
  authors: string;
  year: number;
  title: string;
  venue: string; // Journal / Conference
  doiUrl?: string;
  researchObject: string;
  datasetCharacteristics: string;
  method: string;
  results: string;
  limitations: string;
  researchGap: string;
  relationToGroup: string;
  verificationStatus: 'Telah Dibaca' | 'Sangat Relevan' | 'Perlu Klarifikasi' | 'Arsip';
  relevanceForUserId: string; // Member ID or 'all'
  createdById: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  groupId: string;
  title: string;
  category: 'Data Mentah' | 'Data Hasil Pembersihan' | 'Dokumen Penelitian' | 'Hasil Evaluasi' | 'Naskah Final';
  ownerId: string;
  ownerName: string;
  allowedAccess: 'Semua Anggota' | 'Hanya Pemilik' | 'Pembimbing & Kelompok';
  docUrl: string;
  permissionProofUrl?: string;
  notes?: string;
  updatedAt: string;
}

export interface SupervisionLog {
  id: string;
  groupId: string;
  date: string;
  advisorName: string;
  topic: string;
  feedbackNotes: string;
  revisionList: string;
  assigneeId: string; // Member assigned
  deadline: string;
  status: 'Perlu Revisi' | 'Dalam Proses' | 'Selesai & ACC';
  proofUrl?: string;
  approvalNotes?: string;
  type: 'Rutin' | 'Sempro' | 'Sidang';
  createdAt: string;
}

export interface RevisionItem {
  id: string;
  groupId: string;
  type: 'Sempro' | 'Sidang';
  reviewerName: string; // Dosen Penguji 1/2/3
  reviewerRole: 'Penguji Utama' | 'Penguji Pendamping' | 'Dosen Pembimbing';
  notes: string;
  affectedChapter: string;
  assigneeId: string;
  deadline: string;
  status: 'Belum Dikerjakan' | 'Proses Revisi' | 'Menunggu ACC' | 'Disetujui';
  proofUrl?: string;
  verificationNotes?: string;
  updatedAt: string;
}

export interface ChapterProgress {
  id: string;
  groupId: string;
  chapter: 'Bab I' | 'Bab II' | 'Bab III' | 'Bab IV' | 'Bab V';
  subChapter: string;
  status: ChapterWritingStatus;
  assigneeId: string;
  targetDate?: string;
  completedDate?: string;
  docUrl?: string;
  notes?: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  groupId: string;
  actorId: string;
  actorName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface StageInfo {
  code: string;
  name: string;
  description: string;
}
