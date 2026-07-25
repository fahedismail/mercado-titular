import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-tGQVZboILN4Kiayk9Kg863RLzjFQhBY",
  authDomain: "ayessa-projeto.firebaseapp.com",
  projectId: "ayessa-projeto",
  storageBucket: "ayessa-projeto.firebasestorage.app",
  messagingSenderId: "833008822785",
  appId: "1:833008822785:web:750d46eff6d73ae6e9ae00",
  measurementId: "G-Z6W5W9HBF3",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export type SyncData = {
  answers: Record<string, string | string[]>;
  refAnswers: Record<string, string | string[]>;
  documents: any[];
  logs: any[];
  notifications: any[];
  users: any[];
  lastSync: string;
};

export async function syncUpload(data: Omit<SyncData, "lastSync">): Promise<void> {
  const payload: SyncData = { ...data, lastSync: new Date().toISOString() };
  await setDoc(doc(db, "projeto", "mercado-titular-data"), payload);
}

export async function syncDownload(): Promise<SyncData | null> {
  const snap = await getDoc(doc(db, "projeto", "mercado-titular-data"));
  if (snap.exists()) return snap.data() as SyncData;
  return null;
}
