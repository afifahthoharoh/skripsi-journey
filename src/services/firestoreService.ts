import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  Group,
  UserProfile,
  TaskItem,
  SurveyItem,
  LiteratureItem,
  DocumentItem,
  SupervisionLog,
  RevisionItem,
  ChapterProgress,
  ActivityLog,
  MemberRole,
} from '../types/skripsi';
import { INITIAL_CHECKLIST_TEMPLATES, DEFAULT_CHAPTER_SUBSECTIONS } from '../data/defaultChecklists';

// Helper to generate 6-character uppercase alphanumeric Invite Code
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 1. Create New Research Group
export async function createResearchGroup(
  user: { uid: string; email: string; displayName: string; photoURL: string },
  groupName: string,
  theme: string,
  location: string,
  nim: string
): Promise<{ groupId: string; inviteCode: string }> {
  const groupId = doc(collection(db, 'groups')).id;
  const inviteCode = generateInviteCode();
  const now = new Date().toISOString();

  const newGroup: Group = {
    id: groupId,
    name: groupName,
    theme: theme || 'Tema Penelitian Kelompok Teknik Informatika',
    themeDescription: 'Deskripsi dan latar belakang pemilihan tema besar kelompok penelitian.',
    location: location || 'Lokasi Survei & Objek Penelitian',
    sharedDataSources: 'Data mentah, kuesioner, hasil observasi, dan log sistem bersama.',
    dataPermissions: 'Izin penggunaan data untuk penelitian skripsi Teknik Informatika.',
    advisorNotes: 'Catatan awal dari Dosen Pembimbing.',
    inviteCode,
    creatorId: user.uid,
    activeStage: 'TAHAP A — PERSIAPAN',
    memberCount: 1,
    createdAt: now,
    updatedAt: now,
  };

  const creatorProfile: UserProfile = {
    id: user.uid,
    groupId,
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || 'Mahasiswa 1',
    photoURL: user.photoURL || '',
    nim: nim || '000000000',
    role: 'Ketua Kelompok',
    researchTitleTemp: 'Judul Penelitian Mahasiswa 1 (Drafft)',
    researchTitleApproved: '',
    background: '',
    problemStatement: '',
    objectives: '',
    limitations: '',
    method: '',
    dataset: '',
    expectedContribution: '',
    evaluationIndicators: '',
    approvalStatus: 'Draft',
    joinedAt: now,
  };

  try {
    // Step 1: Save Group doc and Creator Profile doc first
    const initBatch = writeBatch(db);
    initBatch.set(doc(db, 'groups', groupId), newGroup);
    initBatch.set(doc(db, 'groups', groupId, 'users', user.uid), creatorProfile);
    await initBatch.commit();

    // Step 2: Seed Default Tasks, Chapters, and Activity Log
    const seedBatch = writeBatch(db);

    INITIAL_CHECKLIST_TEMPLATES.forEach((tmpl) => {
      const taskId = doc(collection(db, `groups/${groupId}/tasks`)).id;
      const taskItem: TaskItem = {
        id: taskId,
        groupId,
        title: tmpl.title,
        description: `Tugas standar untuk ${tmpl.stage}`,
        stage: tmpl.stage,
        assigneeId: user.uid,
        status: 'Belum Dimulai',
        priority: tmpl.priority as any,
        updatedAt: now,
        createdById: user.uid,
      };
      seedBatch.set(doc(db, 'groups', groupId, 'tasks', taskId), taskItem);
    });

    DEFAULT_CHAPTER_SUBSECTIONS.forEach((chap) => {
      const chapId = doc(collection(db, `groups/${groupId}/chapters`)).id;
      const chapProgress: ChapterProgress = {
        id: chapId,
        groupId,
        chapter: chap.chapter,
        subChapter: chap.subChapter,
        status: 'Belum Ditulis',
        assigneeId: user.uid,
        updatedAt: now,
      };
      seedBatch.set(doc(db, 'groups', groupId, 'chapters', chapId), chapProgress);
    });

    const actId = doc(collection(db, `groups/${groupId}/activities`)).id;
    const initialAct: ActivityLog = {
      id: actId,
      groupId,
      actorId: user.uid,
      actorName: user.displayName || user.email,
      action: 'Membuat Kelompok',
      details: `Kelompok "${groupName}" berhasil dibuat dengan Kode Undangan: ${inviteCode}`,
      timestamp: now,
    };
    seedBatch.set(doc(db, 'groups', groupId, 'activities', actId), initialAct);

    await seedBatch.commit();

    return { groupId, inviteCode };
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `groups/${groupId}`);
    throw err;
  }
}

// 2. Join Group using Invite Code
export async function joinGroupWithCode(
  user: { uid: string; email: string; displayName: string; photoURL: string },
  inviteCode: string,
  nim: string
): Promise<string> {
  const cleanCode = inviteCode.trim().toUpperCase();
  if (!cleanCode) throw new Error('Kode undangan tidak boleh kosong.');

  const groupsRef = collection(db, 'groups');
  const q = query(groupsRef, where('inviteCode', '==', cleanCode));

  try {
    const snap = await getDocs(q);
    if (snap.empty) {
      throw new Error('Kode undangan tidak ditemukan. Periksa kembali kode dari Ketua Kelompok.');
    }

    const groupDoc = snap.docs[0];
    const groupData = groupDoc.data() as Group;
    const groupId = groupDoc.id;

    // Check if user is already in group
    const existingUserDoc = await getDoc(doc(db, 'groups', groupId, 'users', user.uid));
    if (existingUserDoc.exists()) {
      return groupId;
    }

    // Check member limit (Strict Max 3 members!)
    const membersSnap = await getDocs(collection(db, 'groups', groupId, 'users'));
    if (membersSnap.size >= 3) {
      throw new Error('Kelompok ini sudah penuh! Maksimal 3 anggota dalam satu kelompok skripsi.');
    }

    const role: MemberRole = membersSnap.size === 1 ? 'Anggota 1' : 'Anggota 2';
    const now = new Date().toISOString();

    const memberProfile: UserProfile = {
      id: user.uid,
      groupId,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || `Mahasiswa ${membersSnap.size + 1}`,
      photoURL: user.photoURL || '',
      nim: nim || '000000000',
      role,
      researchTitleTemp: `Judul Penelitian ${role} (Draft)`,
      researchTitleApproved: '',
      background: '',
      problemStatement: '',
      objectives: '',
      limitations: '',
      method: '',
      dataset: '',
      expectedContribution: '',
      evaluationIndicators: '',
      approvalStatus: 'Draft',
      joinedAt: now,
    };

    const batch = writeBatch(db);

    // Save Member Profile
    batch.set(doc(db, 'groups', groupId, 'users', user.uid), memberProfile);

    // Update Group member count
    batch.update(doc(db, 'groups', groupId), {
      memberCount: increment(1),
      updatedAt: now,
    });

    // Log Activity
    const actId = doc(collection(db, `groups/${groupId}/activities`)).id;
    const actLog: ActivityLog = {
      id: actId,
      groupId,
      actorId: user.uid,
      actorName: user.displayName || user.email,
      action: 'Bergabung Kelompok',
      details: `${user.displayName || user.email} bergabung sebagai ${role}`,
      timestamp: now,
    };
    batch.set(doc(db, 'groups', groupId, 'activities', actId), actLog);

    await batch.commit();

    return groupId;
  } catch (err) {
    if (err instanceof Error && err.message.includes('Maksimal 3 anggota')) {
      throw err;
    }
    handleFirestoreError(err, OperationType.GET, 'groups');
    throw err;
  }
}

// 3. Find User's Existing Group
export async function findUserGroup(uid: string): Promise<Group | null> {
  try {
    // Search groups where user is member by querying subcollections or checking
    const groupsSnap = await getDocs(collection(db, 'groups'));
    for (const groupDoc of groupsSnap.docs) {
      const groupId = groupDoc.id;
      const userDoc = await getDoc(doc(db, 'groups', groupId, 'users', uid));
      if (userDoc.exists()) {
        return { id: groupId, ...groupDoc.data() } as Group;
      }
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'groups');
    return null;
  }
}

// Helper for Activity Log
export async function logActivity(groupId: string, actorName: string, actorId: string, action: string, details: string) {
  try {
    const actId = doc(collection(db, `groups/${groupId}/activities`)).id;
    const now = new Date().toISOString();
    await setDoc(doc(db, `groups/${groupId}/activities`, actId), {
      id: actId,
      groupId,
      actorId,
      actorName,
      action,
      details,
      timestamp: now,
    });
  } catch (e) {
    console.error('Error logging activity:', e);
  }
}

// Real-time Subscriptions
export function subscribeToGroup(groupId: string, callback: (g: Group) => void) {
  return onSnapshot(
    doc(db, 'groups', groupId),
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as Group);
      }
    },
    (err) => handleFirestoreError(err, OperationType.GET, `groups/${groupId}`)
  );
}

export function subscribeToMembers(groupId: string, callback: (m: UserProfile[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/users`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserProfile));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, `groups/${groupId}/users`)
  );
}

export function subscribeToTasks(groupId: string, callback: (t: TaskItem[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/tasks`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as TaskItem));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, `groups/${groupId}/tasks`)
  );
}

export function subscribeToSurveys(groupId: string, callback: (s: SurveyItem[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/surveys`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SurveyItem));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, `groups/${groupId}/surveys`)
  );
}

export function subscribeToLiteratures(groupId: string, callback: (l: LiteratureItem[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/literatures`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LiteratureItem));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, `groups/${groupId}/literatures`)
  );
}

export function subscribeToDocuments(groupId: string, callback: (d: DocumentItem[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/documents`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DocumentItem));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, `groups/${groupId}/documents`)
  );
}

export function subscribeToSupervisions(groupId: string, callback: (s: SupervisionLog[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/supervisions`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SupervisionLog));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, `groups/${groupId}/supervisions`)
  );
}

export function subscribeToRevisions(groupId: string, callback: (r: RevisionItem[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/revisions`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RevisionItem));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, `groups/${groupId}/revisions`)
  );
}

export function subscribeToChapterProgress(groupId: string, callback: (c: ChapterProgress[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/chapters`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ChapterProgress));
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, `groups/${groupId}/chapters`)
  );
}

export function subscribeToActivities(groupId: string, callback: (a: ActivityLog[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/activities`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ActivityLog));
      // Sort newest first
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(list);
    },
    (err) => handleFirestoreError(err, OperationType.LIST, `groups/${groupId}/activities`)
  );
}

// Generic CRUD Operations
export async function saveTask(groupId: string, task: TaskItem) {
  try {
    const taskRef = doc(db, `groups/${groupId}/tasks`, task.id);
    await setDoc(taskRef, { ...task, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `groups/${groupId}/tasks/${task.id}`);
  }
}

export async function deleteTask(groupId: string, taskId: string) {
  try {
    await deleteDoc(doc(db, `groups/${groupId}/tasks`, taskId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `groups/${groupId}/tasks/${taskId}`);
  }
}

export async function saveUserProfile(groupId: string, profile: UserProfile) {
  try {
    await setDoc(doc(db, `groups/${groupId}/users`, profile.id), profile, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `groups/${groupId}/users/${profile.id}`);
  }
}

export async function saveGroupDetails(groupId: string, details: Partial<Group>) {
  try {
    await updateDoc(doc(db, `groups`, groupId), { ...details, updatedAt: new Date().toISOString() });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `groups/${groupId}`);
  }
}

export async function saveSurveyItem(groupId: string, survey: SurveyItem) {
  try {
    await setDoc(doc(db, `groups/${groupId}/surveys`, survey.id), survey, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `groups/${groupId}/surveys/${survey.id}`);
  }
}

export async function deleteSurveyItem(groupId: string, surveyId: string) {
  try {
    await deleteDoc(doc(db, `groups/${groupId}/surveys`, surveyId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `groups/${groupId}/surveys/${surveyId}`);
  }
}

export async function saveLiteratureItem(groupId: string, lit: LiteratureItem) {
  try {
    await setDoc(doc(db, `groups/${groupId}/literatures`, lit.id), lit, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `groups/${groupId}/literatures/${lit.id}`);
  }
}

export async function deleteLiteratureItem(groupId: string, litId: string) {
  try {
    await deleteDoc(doc(db, `groups/${groupId}/literatures`, litId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `groups/${groupId}/literatures/${litId}`);
  }
}

export async function saveDocumentItem(groupId: string, docItem: DocumentItem) {
  try {
    await setDoc(doc(db, `groups/${groupId}/documents`, docItem.id), docItem, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `groups/${groupId}/documents/${docItem.id}`);
  }
}

export async function deleteDocumentItem(groupId: string, docId: string) {
  try {
    await deleteDoc(doc(db, `groups/${groupId}/documents`, docId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `groups/${groupId}/documents/${docId}`);
  }
}

export async function saveSupervisionLog(groupId: string, sup: SupervisionLog) {
  try {
    await setDoc(doc(db, `groups/${groupId}/supervisions`, sup.id), sup, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `groups/${groupId}/supervisions/${sup.id}`);
  }
}

export async function deleteSupervisionLog(groupId: string, supId: string) {
  try {
    await deleteDoc(doc(db, `groups/${groupId}/supervisions`, supId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `groups/${groupId}/supervisions/${supId}`);
  }
}

export async function saveRevisionItem(groupId: string, rev: RevisionItem) {
  try {
    await setDoc(doc(db, `groups/${groupId}/revisions`, rev.id), rev, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `groups/${groupId}/revisions/${rev.id}`);
  }
}

export async function deleteRevisionItem(groupId: string, revId: string) {
  try {
    await deleteDoc(doc(db, `groups/${groupId}/revisions`, revId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `groups/${groupId}/revisions/${revId}`);
  }
}

export async function saveChapterProgress(groupId: string, chap: ChapterProgress) {
  try {
    await setDoc(doc(db, `groups/${groupId}/chapters`, chap.id), chap, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `groups/${groupId}/chapters/${chap.id}`);
  }
}
