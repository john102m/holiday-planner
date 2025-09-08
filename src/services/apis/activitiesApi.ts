import type { Activity } from "../types";
import { api } from "../apis/api"

// Fetch activities
export const getActivities = async (): Promise<Activity[]> => {
  const res = await api.get<Activity[]>(`/itinerary/activities`);
  return res.data;
};
export const getActivityById = async (id: string): Promise<Activity> => {
  const res = await api.get<Activity>(`/Itinerary/activity/${id}`);
  return res.data;
};
// Fetch activities for a destination
export const getActivitiesByDestinationId = async (destinationId: string): Promise<Activity[]> => {
  const res = await api.get<Activity[]>(`/destinations/${destinationId}/activities`);
  return res.data;
};

// Create an activity
export const createActivity = async (payload: Activity): Promise<Activity> => {
  // matches your Postman: /api/itinerary/createactivity
  const res = await api.post<Activity>("/itinerary/createactivity", payload);
  return res.data;
};

// Update an activity
export const editActivity = async (
  activityId: string,
  data: Activity,
): Promise<void> => {
  await api.post<Activity>(`/itinerary/updateactivity/${activityId}`, data);

};

// Delete an activity
export const deleteActivity = async (
  activityId: string
): Promise<void> => {
  await api.post(`/itinerary/deleteactivity/${activityId}`);
};
