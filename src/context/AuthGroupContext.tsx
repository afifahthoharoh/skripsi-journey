import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
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
} from '../types/skripsi';
import {
  findUserGroup,
  createResearchGroup,
  joinGroupWithCode,
  subscribeToGroup,
  subscribeToMembers,
  subscribeToTasks,
  subscribeToSurveys,
  subscribeToLiteratures,
  subscribeToDocuments,
  subscribeToSupervisions,
  subscribeToRevisions,
  subscribeToChapterProgress,
  subscribeToActivities,
} from '../services/firestoreService';

interface AuthGroupContextType {
  currentUser: User | null;
  loadingAuth: boolean;
  group: Group | null;
  currentUserProfile: UserProfile | null;
  members: UserProfile[];
  tasks: TaskItem[];
  surveys: SurveyItem[];
  literatures: LiteratureItem[];
  documents: DocumentItem[];
  supervisions: SupervisionLog[];
  revisions: RevisionItem[];
  chapters: ChapterProgress[];
  activities: ActivityLog[];
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  createNewGroup: (groupName: string, theme: string, location: string, nim: string) => Promise<void>;
  joinExistingGroup: (inviteCode: string, nim: string) => Promise<void>;
  refreshGroupData: () => Promise<void>;
}

const AuthGroupContext = createContext<AuthGroupContextType | undefined>(undefined);

export const AuthGroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [literatures, setLiteratures] = useState<LiteratureItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [supervisions, setSupervisions] = useState<SupervisionLog[]>([]);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [chapters, setChapters] = useState<ChapterProgress[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Derived current user profile
  const currentUserProfile = members.find((m) => m.uid === currentUser?.uid) || null;

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const foundGroup = await findUserGroup(user.uid);
        setGroup(foundGroup);
      } else {
        setGroup(null);
        setMembers([]);
        setTasks([]);
        setSurveys([]);
        setLiteratures([]);
        setDocuments([]);
        setSupervisions([]);
        setRevisions([]);
        setChapters([]);
        setActivities([]);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore Listeners when Group is active
  useEffect(() => {
    if (!group?.id) return;

    const unsubGroup = subscribeToGroup(group.id, (g) => setGroup(g));
    const unsubMembers = subscribeToMembers(group.id, (m) => setMembers(m));
    const unsubTasks = subscribeToTasks(group.id, (t) => setTasks(t));
    const unsubSurveys = subscribeToSurveys(group.id, (s) => setSurveys(s));
    const unsubLit = subscribeToLiteratures(group.id, (l) => setLiteratures(l));
    const unsubDocs = subscribeToDocuments(group.id, (d) => setDocuments(d));
    const unsubSupervisions = subscribeToSupervisions(group.id, (sup) => setSupervisions(sup));
    const unsubRevisions = subscribeToRevisions(group.id, (r) => setRevisions(r));
    const unsubChapters = subscribeToChapterProgress(group.id, (c) => setChapters(c));
    const unsubActivities = subscribeToActivities(group.id, (a) => setActivities(a));

    return () => {
      unsubGroup();
      unsubMembers();
      unsubTasks();
      unsubSurveys();
      unsubLit();
      unsubDocs();
      unsubSupervisions();
      unsubRevisions();
      unsubChapters();
      unsubActivities();
    };
  }, [group?.id]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Auth Error:', err);
      throw err;
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setGroup(null);
  };

  const createNewGroup = async (groupName: string, theme: string, location: string, nim: string) => {
    if (!currentUser) throw new Error('Harap login terlebih dahulu.');
    const { groupId } = await createResearchGroup(
      {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || 'Mahasiswa',
        photoURL: currentUser.photoURL || '',
      },
      groupName,
      theme,
      location,
      nim
    );
    const newG = await findUserGroup(currentUser.uid);
    setGroup(newG);
  };

  const joinExistingGroup = async (inviteCode: string, nim: string) => {
    if (!currentUser) throw new Error('Harap login terlebih dahulu.');
    await joinGroupWithCode(
      {
        uid: currentUser.uid,
        email: currentUser.email || '',
        displayName: currentUser.displayName || 'Mahasiswa',
        photoURL: currentUser.photoURL || '',
      },
      inviteCode,
      nim
    );
    const newG = await findUserGroup(currentUser.uid);
    setGroup(newG);
  };

  const refreshGroupData = async () => {
    if (currentUser) {
      const g = await findUserGroup(currentUser.uid);
      setGroup(g);
    }
  };

  return (
    <AuthGroupContext.Provider
      value={{
        currentUser,
        loadingAuth,
        group,
        currentUserProfile,
        members,
        tasks,
        surveys,
        literatures,
        documents,
        supervisions,
        revisions,
        chapters,
        activities,
        loginWithGoogle,
        logout,
        createNewGroup,
        joinExistingGroup,
        refreshGroupData,
      }}
    >
      {children}
    </AuthGroupContext.Provider>
  );
};

export const useAuthGroup = () => {
  const context = useContext(AuthGroupContext);
  if (!context) {
    throw new Error('useAuthGroup must be used within an AuthGroupProvider');
  }
  return context;
};
