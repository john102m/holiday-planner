import type {
 Destination
} from "../types";
import {api } from "../apis/api"


// Create: omit id, createdBy, createdAt
export const createDestination = async (
  destination: Omit<Destination, "id" | "createdBy" | "createdAt">
): Promise<Destination> => {
  const res = await api.post<Destination>("/destinations/create", destination);
  return res.data
};

// Create destination and get SAS token if needed
export const createDestinationWithSas = async (
  destination: Omit<Destination, "id" | "createdBy" | "createdAt">
): Promise<{ destination: Destination; sasUrl?: string }> => {
  const res = await api.post("/destinations/createforsas", destination);
  return res.data;
};


// Update: send full object, but backend will ignore id/createdAt
export const editDestination = async (
  id: string,
  destination: Omit<Destination, "createdBy" | "createdAt">
): Promise<void> => {
  await api.post<void>(`/destinations/update/${id}`, destination);
};

// Update destination and get SAS token if needed
export const editDestinationForSas = async (
  id: string,
  destination: Omit<Destination, "createdBy" | "createdAt">
): Promise<{ sasUrl?: string, imageUrl?: string }> => {
  const res = await api.post<{ sasUrl?: string;  imageUrl?: string}>(
    `/destinations/updateforsas/${id}`,
    destination
  );
  return res.data; // { sasUrl } or empty object
};


// ----------------- READ ALL -----------------
export const getDestinations = async (): Promise<Destination[]> => {
  const res = await api.get<Destination[]>("/destinations");
  return res.data;
};

// ----------------- READ BY ID -----------------
export const getDestinationById = async (id: string): Promise<Destination | null> => {
  const res = await api.get<Destination>(`/destinations/${id}`);
  return res.data;
};


// ----------------- DELETE -----------------
export const deleteDestination = async (id: string): Promise<void> => {
  await api.post<void>(`/destinations/delete/${id}`);
};


