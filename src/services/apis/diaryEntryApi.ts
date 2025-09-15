import { api } from "../apis/api";
import type { DiaryEntry } from "../types";

// Create a diary entry
export const createDiaryEntry = async (
  entry: Omit<DiaryEntry, "id" | "createdAt" | "createdBy">
): Promise<{ entry: DiaryEntry; sasUrl?: string }> => {
  console.log("📤 [API] Creating diary entry:", entry.title);
  const res = await api.post<{ entry: DiaryEntry; sasUrl?: string }>(
    `/DiaryEntry/create`,
    entry
  );
  console.log("✅ [API] Diary entry created:", res.data.entry.id);
  return res.data;
};

// Update a diary entry
export const editDiaryEntry = async (
  id: string,
  entry: Omit<DiaryEntry, "createdAt" | "createdBy">
): Promise<{ imageUrl?: string; sasUrl?: string }> => {
  console.log("✏️ [API] Updating diary entry:", id);
  const res = await api.post<{ imageUrl?: string; sasUrl?: string }>(
    `/DiaryEntry/update/${id}`,
    entry
  );
  console.log("✅ [API] Diary entry updated:", id);
  return res.data;
};

// Delete a diary entry
export const deleteDiaryEntry = async (
  id: string
): Promise<void> => {
  console.log("🗑️ [API] Deleting diary entry:", id);
  await api.post(`/DiaryEntry/delete/${id}`);
  console.log("✅ [API] Diary entry deleted:", id);
};

// Get a diary entry by ID
export const getDiaryEntryById = async (
  id: string
): Promise<DiaryEntry> => {
  console.log("🔍 [API] Fetching diary entry by ID:", id);
  const res = await api.get<DiaryEntry>(`/DiaryEntry/${id}`);
  console.log("✅ [API] Fetched diary entry:", res.data.title);
  return res.data;
};

// Get all diary entries for a user
export const getDiaryEntriesByUser = async (
  userId: string
): Promise<DiaryEntry[]> => {
  console.log("📚 [API] Fetching diary entries for user:", userId);
  const res = await api.get<DiaryEntry[]>(`/DiaryEntry/user/${userId}`);
  console.log("✅ [API] Fetched", res.data.length, "entries");
  return res.data;
};

// Get all diary entries (admin/global)
export const getAllDiaryEntries = async (): Promise<DiaryEntry[]> => {
  console.log("🌍 [API] Fetching all diary entries");
  const res = await api.get<DiaryEntry[]>(`/DiaryEntry`);
  console.log("✅ [API] Fetched", res.data.length, "entries");
  return res.data;
};
