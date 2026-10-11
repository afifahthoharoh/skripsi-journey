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
    researchTitleTemp: 'Judul Penelitian Mahasiswa 1 (Draft)',
    researchTitleApproved: '',
    background: '',
    problemStatement: '',
    objectives: '',
    limitations: '',
    method: '',
    dataset: '',
    expectedContribution: '',
    evaluationIndicators: '',
    approvalStatus: 'Disetujui Dosen',
    joinedAt: now,
  };

  try {
    // Step 1: Save Group doc, Creator Profile doc, UserGroup mapping, and InviteCode mapping
    const initBatch = writeBatch(db);
    initBatch.set(doc(db, 'groups', groupId), newGroup);
    initBatch.set(doc(db, 'groups', groupId, 'users', user.uid), creatorProfile);
    initBatch.set(doc(db, 'userGroups', user.uid), {
      userId: user.uid,
      groupId,
      joinedAt: now,
    });
    initBatch.set(doc(db, 'invites', inviteCode), {
      inviteCode,
      groupId,
      groupName,
      memberCount: 1,
    });
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

  let groupId = '';

  try {
    // 1. Try direct lookup in /invites/{cleanCode}
    const inviteDocRef = doc(db, 'invites', cleanCode);
    const inviteSnap = await getDoc(inviteDocRef);

    if (inviteSnap.exists()) {
      groupId = inviteSnap.data().groupId;
    } else {
      // 2. Fallback query for legacy groups
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, where('inviteCode', '==', cleanCode));
      const snap = await getDocs(q);
      if (snap.empty) {
        throw new Error('Kode undangan tidak ditemukan. Periksa kembali kode dari Ketua Kelompok.');
      }
      groupId = snap.docs[0].id;
    }

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
      approvalStatus: 'Diusulkan', // Set to Diusulkan so Ketua Kelompok can ACC!
      joinedAt: now,
    };

    const batch = writeBatch(db);

    // Save Member Profile
    batch.set(doc(db, 'groups', groupId, 'users', user.uid), memberProfile);

    // Save UserGroup mapping
    batch.set(doc(db, 'userGroups', user.uid), {
      userId: user.uid,
      groupId,
      joinedAt: now,
    });

    // Update Group member count
    batch.update(doc(db, 'groups', groupId), {
      memberCount: increment(1),
      updatedAt: now,
    });

    // Update Invite mapping
    batch.set(
      doc(db, 'invites', cleanCode),
      {
        inviteCode: cleanCode,
        groupId,
        memberCount: increment(1),
      },
      { merge: true }
    );

    // Seed individual 14-stage tasks and Bab I-V chapter progress for this member
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
      batch.set(doc(db, 'groups', groupId, 'tasks', taskId), taskItem);
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
      batch.set(doc(db, 'groups', groupId, 'chapters', chapId), chapProgress);
    });

    // Log Activity
    const actId = doc(collection(db, `groups/${groupId}/activities`)).id;
    const actLog: ActivityLog = {
      id: actId,
      groupId,
      actorId: user.uid,
      actorName: user.displayName || user.email,
      action: 'Bergabung Kelompok',
      details: `${user.displayName || user.email} bergabung sebagai ${role} dengan template tugas mandiri.`,
      timestamp: now,
    };
    batch.set(doc(db, 'groups', groupId, 'activities', actId), actLog);

    await batch.commit();

    return groupId;
  } catch (err) {
    if (err instanceof Error && (err.message.includes('Maksimal 3 anggota') || err.message.includes('Kode undangan tidak ditemukan'))) {
      throw err;
    }
    console.error('joinGroupWithCode error:', err);
    throw new Error('Gagal bergabung ke kelompok. Periksa kembali kode undangan dari Ketua Kelompok.');
  }
}

// Ensure every member has their individual task and chapter templates populated
export async function ensureUserTaskTemplates(groupId: string, userId: string) {
  try {
    const tasksRef = collection(db, `groups/${groupId}/tasks`);
    const q = query(tasksRef, where('assigneeId', '==', userId));
    const snap = await getDocs(q);

    if (snap.empty) {
      const seedBatch = writeBatch(db);
      const now = new Date().toISOString();

      INITIAL_CHECKLIST_TEMPLATES.forEach((tmpl) => {
        const taskId = doc(collection(db, `groups/${groupId}/tasks`)).id;
        const taskItem: TaskItem = {
          id: taskId,
          groupId,
          title: tmpl.title,
          description: `Tugas standar untuk ${tmpl.stage}`,
          stage: tmpl.stage,
          assigneeId: userId,
          status: 'Belum Dimulai',
          priority: tmpl.priority as any,
          updatedAt: now,
          createdById: userId,
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
          assigneeId: userId,
          updatedAt: now,
        };
        seedBatch.set(doc(db, 'groups', groupId, 'chapters', chapId), chapProgress);
      });

      await seedBatch.commit();
    }
  } catch (err) {
    console.error('Error ensuring user task templates:', err);
  }
}

// 3. Remove Member From Group (Exclusive for Ketua Kelompok to reset incorrect NIM/Email joins)
export async function removeMemberFromGroup(
  groupId: string,
  memberId: string,
  memberUid: string,
  inviteCode: string,
  memberName: string
) {
  try {
    const batch = writeBatch(db);

    // Delete user profile document in group
    batch.delete(doc(db, `groups/${groupId}/users`, memberId));

    // Delete user-group mapping so user can rejoin or create new group
    batch.delete(doc(db, 'userGroups', memberUid));

    // Decrement group member count
    batch.update(doc(db, 'groups', groupId), {
      memberCount: increment(-1),
      updatedAt: new Date().toISOString(),
    });

    // Decrement invite count
    if (inviteCode) {
      batch.set(
        doc(db, 'invites', inviteCode),
        {
          memberCount: increment(-1),
        },
        { merge: true }
      );
    }

    // Log Activity
    const actId = doc(collection(db, `groups/${groupId}/activities`)).id;
    batch.set(doc(db, `groups/${groupId}/activities`, actId), {
      id: actId,
      groupId,
      actorId: memberUid,
      actorName: memberName,
      action: 'Hapus Data Anggota',
      details: `Data anggota ${memberName} telah dihapus/dikeluarkan oleh Ketua Kelompok untuk pengulangan pendaftaran.`,
      timestamp: new Date().toISOString(),
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `groups/${groupId}/users/${memberId}`);
  }
}

// 4. Find User's Existing Group
export async function findUserGroup(uid: string): Promise<Group | null> {
  try {
    // 1. Direct lookup in /userGroups/{uid}
    const userGroupSnap = await getDoc(doc(db, 'userGroups', uid));
    if (userGroupSnap.exists()) {
      const groupId = userGroupSnap.data().groupId;
      const groupSnap = await getDoc(doc(db, 'groups', groupId));
      if (groupSnap.exists()) {
        return { id: groupId, ...groupSnap.data() } as Group;
      }
    }

    // 2. Fallback search for legacy groups
    const groupsSnap = await getDocs(collection(db, 'groups'));
    for (const groupDoc of groupsSnap.docs) {
      const groupId = groupDoc.id;
      const userDoc = await getDoc(doc(db, 'groups', groupId, 'users', uid));
      if (userDoc.exists()) {
        const groupData = { id: groupId, ...groupDoc.data() } as Group;
        try {
          await setDoc(doc(db, 'userGroups', uid), { userId: uid, groupId, joinedAt: new Date().toISOString() });
          if (groupData.inviteCode) {
            await setDoc(doc(db, 'invites', groupData.inviteCode), {
              inviteCode: groupData.inviteCode,
              groupId,
              groupName: groupData.name,
              memberCount: groupData.memberCount || 1,
            }, { merge: true });
          }
        } catch (e) {
          /* ignore */
        }
        return groupData;
      }
    }
    return null;
  } catch (err) {
    console.log('User is not yet in any group:', err);
    return null; // Gracefully return null so NO error box is displayed to first-time users!
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
    (err) => console.log('subscribeToGroup notice:', err)
  );
}

export function subscribeToMembers(groupId: string, callback: (m: UserProfile[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/users`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserProfile));
      callback(list);
    },
    (err) => console.log('subscribeToMembers notice:', err)
  );
}

export function subscribeToTasks(groupId: string, callback: (t: TaskItem[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/tasks`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as TaskItem));
      callback(list);
    },
    (err) => console.log('subscribeToTasks notice:', err)
  );
}

export function subscribeToSurveys(groupId: string, callback: (s: SurveyItem[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/surveys`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SurveyItem));
      callback(list);
    },
    (err) => console.log('subscribeToSurveys notice:', err)
  );
}

export function subscribeToLiteratures(groupId: string, callback: (l: LiteratureItem[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/literatures`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LiteratureItem));
      callback(list);
    },
    (err) => console.log('subscribeToLiteratures notice:', err)
  );
}

export function subscribeToDocuments(groupId: string, callback: (d: DocumentItem[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/documents`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as DocumentItem));
      callback(list);
    },
    (err) => console.log('subscribeToDocuments notice:', err)
  );
}

export function subscribeToSupervisions(groupId: string, callback: (s: SupervisionLog[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/supervisions`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SupervisionLog));
      callback(list);
    },
    (err) => console.log('subscribeToSupervisions notice:', err)
  );
}

export function subscribeToRevisions(groupId: string, callback: (r: RevisionItem[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/revisions`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RevisionItem));
      callback(list);
    },
    (err) => console.log('subscribeToRevisions notice:', err)
  );
}

export function subscribeToChapterProgress(groupId: string, callback: (c: ChapterProgress[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/chapters`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ChapterProgress));
      callback(list);
    },
    (err) => console.log('subscribeToChapterProgress notice:', err)
  );
}

export function subscribeToActivities(groupId: string, callback: (a: ActivityLog[]) => void) {
  return onSnapshot(
    collection(db, `groups/${groupId}/activities`),
    (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ActivityLog));
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(list);
    },
    (err) => console.log('subscribeToActivities notice:', err)
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
