import type { Activity } from "../types";
import { api } from "../apis/api"
import { stripSasToken } from "../../components/utilities";

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

//Create activity and get SAS token if needed

export const createActivityWithSas = async (
  activity: Omit<Activity, "id" | "createdAt" | "createdBy">
): Promise<{ activity: Activity; sasUrl?: string; imageUrl?: string }> => {

  const payload = {
    name: activity.name,
    details: activity.details,
    destinationId: activity.destinationId,
    tripId: activity.tripId,
    linkUrl: activity.linkUrl,
    votes: activity.votes,
    isPrivate: activity.isPrivate,
    hasImage: activity.hasImage,
    imageUrl: stripSasToken(activity.imageUrl ?? "")
  };

  console.log("Creating an activity (cleaned) ", payload);

  const res = await api.post<{ activity: Activity; sasUrl?: string; imageUrl?: string }>(
    `/itinerary/createforsas`,
    payload
  );

  return res.data;
};


// // Update activity and get SAS token if needed
export const editActivityForSas = async (
  id: string,
  activity: Omit<Activity, "createdAt" | "createdBy">
): Promise<{ sasUrl?: string; imageUrl?: string }> => {
  console.log("Sending this to backend: ", activity)
  activity.imageUrl = stripSasToken(activity.imageUrl ?? "");
  const res = await api.post<{ sasUrl?: string; imageUrl?: string }>(
    `/itinerary/updateforsas/${id}`,
    activity
  );
  return res.data;
};

