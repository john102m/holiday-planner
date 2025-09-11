import axios from "axios";
import type { ActivityComment, User, UserTrip } from "../types";
import type { Destination } from "../types";

const SUPABASE_URL = "https://flsfxunqswwasoeqckjk.supabase.co/auth/v1/token";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsc2Z4dW5xc3d3YXNvZXFja2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MTQ4NTEsImV4cCI6MjA3MTk5MDg1MX0.buHOMU8QuLJ3LI9s-sOg0vGEqQyezWiLFAVUr6UiI0k"; // from Supabase settings
const EMAIL = "john@test.com";
const PASSWORD = "my4321pass";

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });


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

export const getSasToken = async (): Promise<{ sasUrl: string; blobName: string }> => {
  const res = await api.get("/users/generate-sas");
  return res.data;
};

export const postNameForSasToken = async (blobName: string): Promise<{ sasUrl: string; blobName: string }> => {
  const res = await api.post("/users/generate-sas", { blobName });
  return res.data;
};


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


// Create an comment
export interface CreateCommentPayload {
  activityId: string;
  content: string;
}

export const createComment = async (data: CreateCommentPayload): Promise<Comment> => {
  const res = await api.post<Comment>(`/comments/create`, data);
  return res.data;
};

// Fetch all comments
export const getComments = async (): Promise<ActivityComment[]> => {
  const res = await api.get<ActivityComment[]>("/comments");
  return res.data;
};

function sanitizeDate(input: unknown): string | undefined {
  if (!input) return undefined;

  if (typeof input === "string" || typeof input === "number" || input instanceof Date) {
    const date = new Date(input);
    if (isNaN(date.getTime()) || date.getFullYear() < 1753) return undefined;
    return date.toISOString();
  }

  return undefined;
}



// ----------------- CREATE -----------------
export const createUserTrip = async (trip: Partial<UserTrip>): Promise<UserTrip> => {
  const res = await api.post<UserTrip>('/users/createtrip', trip);
  return res.data;
};


// ----------------- UPDATE -----------------
export const editUserTrip = async (
  tripId: string,
  tripUpdates: Partial<UserTrip>
): Promise<UserTrip> => {
  const dateSafeUpdates = {
    ...tripUpdates,
    startDate: sanitizeDate(tripUpdates.startDate),
    endDate: sanitizeDate(tripUpdates.endDate),
  };
  console.log("Posting trip update", dateSafeUpdates);
  const res = await api.post<UserTrip>(`/users/updatetrip/${tripId}`, dateSafeUpdates);
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


// Create: omit id, createdBy, createdAt
export const createDestination = async (
  destination: Omit<Destination, "id" | "createdBy" | "createdAt">
): Promise<Destination> => {
  const res = await api.post<Destination>("/destinations/create", destination);
  return res.data
};

// Update: send full object, but backend will ignore id/createdAt
export const editDestination = async (
  id: string,
  destination: Omit<Destination, "createdBy" | "createdAt">
): Promise<void> => {
  await api.post<void>(`/destinations/update/${id}`, destination);
};


// ----------------- READ ALL -----------------
export const getAllDestinations = async (): Promise<Destination[]> => {
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



