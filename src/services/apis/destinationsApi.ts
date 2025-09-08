import type {
 Destination
} from "../types";
import {api } from "../apis/api"

// Fetch all destinations
export const getDestinations = async (): Promise<Destination[]> => {
  const res = await api.get<Destination[]>("/destinations");
  return res.data;
};
// export const getDestinations = async (): Promise<Destination[]> => {
//   const res = await api.get<Destination[]>("/destinations", {
//     headers: {
//       Authorization: `Bearer ${JWT_TOKEN}`, // include the token here
//       'Content-Type': 'application/json',
//     },
//   });

//   return res.data;
// };


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
  const res = await api.post<Destination>(`/destinations/${id}`, data);
  return res.data;
};

// Delete a destination
export const deleteDestination = async (id: string): Promise<void> => {
  await api.post(`/destinations/${id}`);
};

