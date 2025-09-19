import axios from "axios";
import type { User, UserTrip } from "../types";


const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const EMAIL = import.meta.env.VITE_SUPABASE_EMAIL;
const PASSWORD = import.meta.env.VITE_SUPABASE_PASSWORD;

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

export const getUsers = async () => {
  try {
    const response = await api.get<User[]>(`/Users`);
    return response.data; // Should include user ID and other details
  } catch (error) {
    console.error("Error fetching users, ", error);
    return null;
  }
};
export const updateUser = async (user: User) => {
  await api.post("/Users/updateuser", user);
};

export const deleteUser = async (id: string) => {
  await api.post(`/Users/delete/${id}`);
};

export const getUserById = async (id: string): Promise<User> => {
  console.log("Fetching user from API:", id);
  const response = await api.get(`/Users/${id}`);
  console.log("API response:", response.data);
  return response.data;
};

export async function setUserRoles(userId: string, roles: string[]) {
  return api.post(`/api/users/${userId}/roles`, roles);
}


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
// export const createUserTrip = async (trip: Partial<UserTrip>): Promise<UserTrip> => {
//   const res = await api.post<UserTrip>('/users/createtrip', trip);
//   return res.data;
// };

export const createUserTrip = async (
  trip: Omit<UserTrip, "id" | "createdAt">
): Promise<{ trip: UserTrip; sasUrl?: string }> => {
  const res = await api.post<{ userTrip: UserTrip; sasUrl?: string }>(
    `/users/createtrip`,
    trip
  );

  if (!res.data.userTrip) {
    console.warn("⚠️ Backend did not return a userTrip object:", res.data);
    throw new Error("Trip creation failed: missing userTrip in response");
  }

  return {
    trip: res.data.userTrip,
    sasUrl: res.data.sasUrl ?? undefined,
  };
};



// ----------------- UPDATE -----------------
export const editUserTrip = async (
  tripId: string,
  tripUpdates: Partial<UserTrip>
): Promise<{ sasUrl?: string; imageUrl?: string }> => {
  const dateSafeUpdates = {
    ...tripUpdates,
    startDate: sanitizeDate(tripUpdates.startDate),
    endDate: sanitizeDate(tripUpdates.endDate),
  };

  console.log("📤 Posting trip update:", dateSafeUpdates);

  const res = await api.post<{ sasUrl?: string; imageUrl?: string }>(
    `/users/updatetrip/${tripId}`,
    dateSafeUpdates
  );

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


