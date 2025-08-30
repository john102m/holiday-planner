import axios from "axios";
import type { Destination, Activity } from "../types";

const SUPABASE_URL = "https://flsfxunqswwasoeqckjk.supabase.co/auth/v1/token";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc2Z4dW5xc3d3YXNvZXFja2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MTQ4NTEsImV4cCI6MjA3MTk5MDg1MX0.buHOMU8QuLJ3LI9s-sOg0vGEqQyezWiLFAVUr6UiI0k"; // from Supabase settings
const EMAIL = "john@test.com";
const PASSWORD = "my4321pass";

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });


// Read tokens from localStorage (or memory)
let accessToken = localStorage.getItem("access_token");
let refreshToken = localStorage.getItem("refresh_token");

export async function login() {
  const { data } = await axios.post(
    `${SUPABASE_URL}?grant_type=password`,
    {
      email: EMAIL,
      password: PASSWORD,
    },
    {
      headers: {
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
      },
    }
  );
  
  // Save tokens for later
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);

  return data;
}


// 🔑 Login
// export async function login(email: string, password: string) {
//   const res = await axios.post(
//     `${SUPABASE_AUTH_URL}?grant_type=password`,
//     { email, password },
//     {
//       headers: {
//         apikey: SUPABASE_ANON_KEY,
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   accessToken = res.data.access_token;
//   refreshToken = res.data.refresh_token;

//   localStorage.setItem("access_token", accessToken ?? "");
//   localStorage.setItem("refresh_token", refreshToken ?? "");

//   return { accessToken, refreshToken };
// }

// 🔄 Refresh
async function refreshTokens() {
  if (!refreshToken) throw new Error("No refresh token available");

  const res = await axios.post(
    `${SUPABASE_URL}?grant_type=refresh_token`,
    { refresh_token: refreshToken },
    {
      headers: {
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  accessToken = res.data.access_token;
  refreshToken = res.data.refresh_token;

  localStorage.setItem("access_token", accessToken ?? "");
  localStorage.setItem("refresh_token", refreshToken ?? "");

  return accessToken;
}

// ✅ Attach token to requests
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});


// 🔄 Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshTokens();
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest); // retry original
      } catch (refreshErr) {
        console.error("Token refresh failed", refreshErr);
        // maybe redirect to login
      }
    }

    return Promise.reject(error);
  }
);
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

