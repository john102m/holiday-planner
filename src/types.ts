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
  id: string;               // Guid → string
  destinationId?: string;    // nullable Guid → optional string
  name?: string;             // nullable → optional
  details?: string;          // nullable → optional
  votes?: number;            // nullable int → optional number
  createdBy?: string;        // nullable Guid → optional string
  createdAt?: string;        // nullable DateTime → optional string
  imageUrl?: string;         // nullable → optional
}
