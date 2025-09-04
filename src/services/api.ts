import axios from "axios";
import type { Destination, Activity, Package, Itinerary, User, ActivityComment, UserTrip } from "./types";

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

export const getUserByEmail = async (user: string) => {
  try {
    const response = await api.get<User>(`/users/find`, {
      params: { user },
    });
    return response.data; // Should include user ID and other details
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
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
  const res = await api.post<Destination>(`/destinations/${id}`, data);
  return res.data;
};

// Delete a destination
export const deleteDestination = async (id: string): Promise<void> => {
  await api.post(`/destinations/${id}`);
};

// Fetch activities for a destination
export const getActivitiesByDestinationId = async (destinationId: string): Promise<Activity[]> => {
  const res = await api.get<Activity[]>(`/destinations/${destinationId}/activities`);
  return res.data;
};

// ----------------- CREATE -----------------
export const createUserTrip = async (trip: Partial<UserTrip>): Promise<UserTrip> => {
  const res = await api.post<UserTrip>('/users/createtrip', trip);
  return res.data;
};

// ----------------- UPDATE -----------------
export const updateUserTrip = async (
  tripId: string,
  tripUpdates: Partial<UserTrip>
): Promise<UserTrip> => {
  const res = await api.post<UserTrip>(`/users/updatetrip/${tripId}`, tripUpdates);
  return res.data;
};

// ----------------- DELETE -----------------
export const deleteUserTrip = async (tripId: string): Promise<void> => {
  await api.post<void>(`/users/deletetrip/${tripId}`);
};

// ----------------- GET BY USER -----------------
export const getUserTrips = async (userId: string): Promise<UserTrip[]> => {
  const res = await api.get<UserTrip[]>(`/users/getusertrips/${userId}`);
  return res.data;
};

// ----------------- GET BY TRIP ID -----------------
export const getUserTripByTripId = async (tripId: string): Promise<UserTrip | null> => {
  const res = await api.get<UserTrip>(`/users/getusertripbyid/${tripId}`);
  return res.data;
};

// Fetch activities
export const getActivities = async (): Promise<Activity[]> => {
  const res = await api.get<Activity[]>(`/itinerary/activities`);
  return res.data;
};
export const getActivityById = async (id: string): Promise<Activity> => {
  const res = await api.get<Activity>(`/Itinerary/activity/${id}`);
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

// Create an comment
export interface CreateCommentPayload {
  activityId: string;
  content: string;
}

export const createComment = async (data: CreateCommentPayload): Promise<Comment> => {
  const res = await api.post<Comment>(`/comments/create`, data);
  return res.data;
};

// Fetch all packages
export const getPackages = async (): Promise<Package[]> => {
  const res = await api.get<Package[]>("/packages");
  return res.data;
};

// Fetch all itineraries
export const getItineraries = async (): Promise<Itinerary[]> => {
  const res = await api.get<Itinerary[]>("/itinerary");
  return res.data;
};

// Fetch all comments
export const getComments = async (): Promise<ActivityComment[]> => {
  const res = await api.get<ActivityComment[]>("/comments");
  return res.data;
};
// // Fetch activities a user has saved / voted for
// export const getSavedActivities = async (userId: string): Promise<Activity[]> => {
//   const res = await api.get<Activity[]>(`/api/ActivityUser/user/${userId}/saved`);
//   return res.data;
// };
// // Fetch comments for an activity
// export const getCommentsByActivityId = async (activityId: string): Promise<Comment[]> => {
//   const res = await api.get<Comment[]>(`/comments/activity/${activityId}`);
//   return res.data;
// };


export const getItineraryById = async (id: string): Promise<Itinerary> => {
  const res = await api.get<Itinerary>(`/Itinerary/${id}`);
  return res.data;
};
export const createItinerary = async (
  data: Omit<Itinerary, "id" | "createdAt">  // leave id & createdAt to backend
): Promise<Itinerary> => {
  const res = await api.post<Itinerary>("/itinerary/create", data);
  return res.data;
};
export const updateItinerary = async (
  id: string,
  data: Partial<Omit<Itinerary, "id" | "createdAt">>
): Promise<Itinerary> => {
  const res = await api.put<Itinerary>(`/itinerary/update/${id}`, data);
  return res.data;
};
export const deleteItinerary = async (id: string): Promise<void> => {
  await api.delete(`/itinerary/delete/${id}`);
};
