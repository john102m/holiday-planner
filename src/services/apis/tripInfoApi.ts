import { api } from "../apis/api";
import type { TripInfo } from "../types";
import { stripSasToken } from "../../components/utilities";

// Create a TripInfo entry
export const createTripInfo = async (
  rawEntry: Partial<TripInfo>
): Promise<{ entry: TripInfo; sasUrl?: string }> => {
  console.log("📤 [API] Creating TripInfo:", rawEntry.title);

  // Sanitize payload to match TripInfoDto
  const entry = {
    tripId: rawEntry.tripId,
    type: rawEntry.type,
    title: rawEntry.title?.trim() || undefined,
    description: rawEntry.description?.trim() || undefined,
    location: rawEntry.location?.trim() || undefined,
    startDate: rawEntry.startDate ? new Date(rawEntry.startDate).toISOString() : undefined,
    endDate: rawEntry.endDate ? new Date(rawEntry.endDate).toISOString() : undefined,
    hasImage: !!rawEntry.imageUrl,
    imageUrl: stripSasToken(rawEntry.imageUrl ?? ""),
  };
console.log("🧪 Final TripInfo payload:", JSON.stringify(entry, null, 2));

  const res = await api.post<{ entry: TripInfo; sasUrl?: string }>(
    `/TripInfo/create`,
    entry
  );

  console.log("✅ [API] TripInfo created:", res.data.entry?.id);
  return res.data;
};

// Update a TripInfo entry
export const updateTripInfo = async (
  id: string,
  entry: Omit<TripInfo, "Id" | "CreatedAt" | "CreatedBy">
): Promise<{ imageUrl?: string; sasUrl?: string }> => {
  console.log("✏️ [API] Updating TripInfo:", id);
  entry.imageUrl = stripSasToken(entry.imageUrl ?? "");
  const res = await api.post<{ imageUrl?: string; sasUrl?: string }>(
    `/TripInfo/update/${id}`,
    entry
  );
  console.log("✅ [API] TripInfo updated:", id);
  return res.data;
};

// Delete a TripInfo entry
export const deleteTripInfo = async (
  id: string
): Promise<void> => {
  console.log("🗑️ [API] Deleting TripInfo:", id);
  await api.post(`/TripInfo/delete/${id}`);
  console.log("✅ [API] TripInfo deleted:", id);
};

// Get a TripInfo entry by ID
export const getTripInfoById = async (
  id: string
): Promise<TripInfo> => {
  console.log("🔍 [API] Fetching TripInfo by ID:", id);
  const res = await api.get<TripInfo>(`/TripInfo/${id}`);
  console.log("✅ [API] Fetched TripInfo:", res.data.title);
  return res.data;
};

// Get all TripInfo entries for a trip
export const getTripInfoByTripId = async (
  tripId: string
): Promise<TripInfo[]> => {
  console.log("📚 [API] Fetching TripInfo for trip:", tripId);
  const res = await api.get<TripInfo[]>(`/TripInfo/trip/${tripId}`);
  console.log("✅ [API] Fetched", res.data.length, "entries");
  return res.data;
};

// Get all TripInfo entries (admin/global)
export const getAllTripInfo = async (): Promise<TripInfo[]> => {
  console.log("🌍 [API] Fetching all TripInfo entries");
  const res = await api.get<TripInfo[]>(`/TripInfo`);
  console.log("✅ [API] Fetched", res.data.length, "entries");
  return res.data;
};
