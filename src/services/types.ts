export interface Day {
  day: number;
  title: string;
  img: string;
  activities: string[];
}

export interface Destination {
  id: string;               // Guid → string
  name?: string;            // nullable → optional
  area?: string;            // nullable → optional
  country?: string;         // nullable → optional
  description?: string;     // nullable → optional
  imageUrl?: string;        // nullable → optional
  createdBy?: string;       // nullable Guid → optional string
  createdAt: string;        // DateTime → string in JSON
}

export interface Activity {
  id?: string;               // Guid → string
  destinationId: string;    // nullable Guid → optional string
  name?: string;             // nullable → optional
  details?: string;          // nullable → optional
  votes?: number;            // nullable int → optional number
  createdBy?: string;        // nullable Guid → optional string
  createdAt?: string;        // nullable DateTime → optional string
  imageUrl?: string;         // nullable → optional
}

export interface ActivityComment {
  id?: string;               // Guid → string
  activityId?: string;    // nullable Guid → optional string
  content: string;             // nullable → optional
  createdBy?: string;        // nullable Guid → optional string
  createdAt?: string;        // nullable DateTime → optional string

}
// src/services/types.ts

export interface Package {
  id: string;
  destinationId: string;
  name: string;
  region: string;
  description?: string;
  nights?: number;
  price?: number;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
}

export interface User {
  "id": string,
  "name": string,
  "email": string,
  "avatarUrl": string,
  "role": string,
  "createdAt": string
}

export interface UserTrip {
  "id": string,
  "userId": string,
  "destinationId": string,
  "status": string,
  "startDate": string,
  "endDate": string,
  "createdAt": string
}

export interface Itinerary {
  id: string;
  destinationId: string;
  name: string;
  description?: string; // optional
  slug?: string;        // optional
  tags?: string;        // optional (comma-separated)
  imageUrl?: string;    // optional
  createdBy: string;
  createdAt: string;
}
export interface DashboardActivity {
  id: string;
  name: string;
  completed?: boolean; // optional, if relevant
}

export interface DashboardItinerary {
  id: string;
  destinationId: string;
  name?: string;
  description?: string;
  slug?: string;
  tags?: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: string;

  // Dashboard-specific fields
  activities?: DashboardActivity[];          // number of activities
  updatedAt?: string;          // last updated timestamp
  role?: "Owner" | "Editor" | "Viewer";
  heroImage?: string;          // optional override for dashboard card
}



