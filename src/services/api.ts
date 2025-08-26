import axios from "axios";
import type { Destination, Activity } from "../types";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// Fetch all destinations
export const getDestinations = async (): Promise<Destination[]> => {
  const res = await api.get<Destination[]>("/destinations");
  return res.data;
};

// Create a new destination
export const createDestination = async (
  data: Omit<Destination, "id" | "createdAt">  // leave id & createdAt to backend
): Promise<Destination> => {
  const res = await api.post<Destination>("/destinations", data);
  return res.data;
};

// Update a destination
export const updateDestination = async (
  id: string,
  data: Partial<Omit<Destination, "id" | "createdAt">>
): Promise<Destination> => {
  const res = await api.put<Destination>(`/destinations/${id}`, data);
  return res.data;
};

// Delete a destination
export const deleteDestination = async (id: string): Promise<void> => {
  await api.delete(`/destinations/${id}`);
};

// Fetch activities for a destination
export const getActivities = async (destinationId: string): Promise<Activity[]> => {
  const res = await api.get<Activity[]>(`/destinations/${destinationId}/activities`);
  return res.data;
};

// Create an activity
export const createActivity = async (
  destinationId: string,
  data: Omit<Activity, "id" | "createdAt" | "destinationId">  // backend fills id, createdAt, destinationId
): Promise<Activity> => {
  const res = await api.post<Activity>(`/destinations/${destinationId}/activities`, data);
  return res.data;
};

// Update an activity
export const updateActivity = async (
  destinationId: string,
  activityId: string,
  data: Partial<Omit<Activity, "id" | "createdAt" | "destinationId">>
): Promise<Activity> => {
  const res = await api.put<Activity>(`/destinations/${destinationId}/activities/${activityId}`, data);
  return res.data;
};

// Delete an activity
export const deleteActivity = async (
  destinationId: string,
  activityId: string
): Promise<void> => {
  await api.delete(`/destinations/${destinationId}/activities/${activityId}`);
};

