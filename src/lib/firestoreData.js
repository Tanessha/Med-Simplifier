import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export const emptyHealthProfile = {
  medicalHistory: "",
  allergies: "",
  conditions: "",
  emergencyContact: "",
  reports: [],
  prescriptions: [],
  appointments: [],
  reminders: [],
};

export const getUserProfileDoc = async (userId) => {
  const userRef = doc(firestore, "users", userId);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? snapshot.data() : null;
};

export const getHealthProfile = async (userId) => {
  const profileRef = doc(firestore, "healthProfiles", userId);
  const snapshot = await getDoc(profileRef);

  if (!snapshot.exists()) {
    await setDoc(profileRef, {
      ...emptyHealthProfile,
      updatedAt: serverTimestamp(),
    });
    return emptyHealthProfile;
  }

  return { ...emptyHealthProfile, ...snapshot.data() };
};

export const saveHealthProfile = async (userId, profile) => {
  const profileRef = doc(firestore, "healthProfiles", userId);
  await setDoc(
    profileRef,
    {
      ...profile,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const saveLiteracyLevel = async (userId, literacyLevel) => {
  const userRef = doc(firestore, "users", userId);
  await updateDoc(userRef, {
    literacyLevel,
    updatedAt: serverTimestamp(),
  });
};

export const getScanHistory = async (userId) => {
  const historyRef = collection(firestore, "users", userId, "scanHistory");
  const snapshot = await getDocs(query(historyRef, orderBy("createdAt", "desc")));
  return snapshot.docs.map((item) => ({
    _id: item.id,
    ...item.data(),
  }));
};

export const addScanHistory = async (userId, payload) => {
  const historyRef = collection(firestore, "users", userId, "scanHistory");
  await addDoc(historyRef, {
    ...payload,
    createdAt: new Date().toISOString(),
    createdAtServer: serverTimestamp(),
  });
};
