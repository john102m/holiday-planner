import { api } from "../apis/api";
import type { TripInfo } from "../types";
import { stripSasToken } from "../../components/utilities";

// Create a TripInfo entry
export const createTripInfo = async (
    info: Omit<TripInfo, "id" | "createdAt" | "createdBy">
): Promise<{ tripInfo: TripInfo; sasUrl?: string }> => {
    console.log("📤 [API] Creating TripInfo:", info.title);

    info.imageUrl = stripSasToken(info.imageUrl ?? "");
    // const sanitized: TripInfo = {
    //     ...entry,
    //     startDate: entry.startDate || undefined,
    //     endDate: entry.endDate || undefined,
    // };


    const res = await api.post<{ tripInfo: TripInfo; sasUrl?: string }>(
        `/TripInfo/create`,
        info
    );

    console.log("✅ [API] TripInfo created:", res.data.tripInfo?.id);
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
