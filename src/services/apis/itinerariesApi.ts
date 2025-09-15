
import type {
  Itinerary, ItineraryActivity,
  ItineraryActivitiesBatch
} from "../types";
import { api } from "../apis/api"

export const getItineraryById = async (id: string): Promise<Itinerary> => {
  const res = await api.get<Itinerary>(`/Itinerary/${id}`);
  return res.data;
};

// Fetch all itineraries
export const getItineraries = async (): Promise<Itinerary[]> => {
  const res = await api.get<Itinerary[]>("/itinerary");
  return res.data;
};
export const createItinerary_old = async (
  data: Omit<Itinerary, "id" | "createdAt">  // leave id & createdAt to backend
): Promise<Itinerary> => {
  const res = await api.post<Itinerary>("/itinerary/create", data);
  return res.data;
};
export const createItinerary = async (
  itinerary: Omit<Itinerary, "id" | "createdAt" | "createdBy">
): Promise<{ itinerary: Itinerary; sasUrl?: string; imageUrl?: string }> => {
  const res = await api.post<{ itinerary: Itinerary; sasUrl?: string; imageUrl?: string }>(
    `/itinerary/create`,
    itinerary
  );

  if (!res.data.itinerary) {
    console.warn("⚠️ Backend did not return an itinerary object:", res.data);
    throw new Error("Itinerary creation failed: missing itinerary in response");
  }

  return res.data;
};
export const editItinerary = async (
  id: string,
  itinerary: Omit<Itinerary, "createdAt" | "createdBy">
): Promise<{ sasUrl?: string; imageUrl?: string }> => {
  const res = await api.post<{ sasUrl?: string; imageUrl?: string }>(
    `/itinerary/update/${id}`,
    itinerary
  );

  return res.data;
};


export const deleteItinerary = async (id: string): Promise<void> => {
  await api.post(`/itinerary/delete/${id}`);
};

// Update itinerary
export const editItinerary_old = async (id: string, data: Partial<Itinerary>): Promise<void> => {
  await api.post(`/itinerary/update/${id}`, data);
};

// Fetch all itinerary-activity relationships
export const getItineraryActivities = async (): Promise<ItineraryActivity[]> => {
  const res = await api.get<ItineraryActivity[]>("/itinerary/itineraryactivities");
  return res.data;
};

// Add activity to itinerary
export const createItineraryActivity = async (payload: ItineraryActivity): Promise<ItineraryActivity> => {
  console.log("just sending the payload now: ", payload)
  const res = await api.post<ItineraryActivity>("/itinerary/itineraryactivity", payload);
  console.log("the res was: ", res);
  return res.data;
};

// Update itinerary-activity relationship
export const editItineraryActivity = async (id: string, data: Partial<ItineraryActivity>): Promise<void> => {
  await api.post(`/itinerary/itineraryactivity/${id}`, data);
};

// Delete itinerary-activity relationship
export const deleteItineraryActivity = async (id: string): Promise<void> => {
  await api.post(`/itinerary/deleteitineraryactivity/${id}`);
};


// Batch update itinerary-activity relationships
export const updateItineraryActivitiesBatch = async (
  payload: ItineraryActivitiesBatch
): Promise<ItineraryActivity[]> => {
  console.log("Sending batch payload:", payload);
  const res = await api.post<ItineraryActivity[]>(
    `/itinerary/batchupdate`,
    payload
  );
  console.log("Batch response:", res);
  return res.data;
};

