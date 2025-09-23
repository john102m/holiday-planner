export const CollectionTypes = {
  Activities: "activities",
  Packages: "packages",
  Destinations: "destinations",
  Itineraries: "itineraries",
  ItineraryActivities: "itineraryActivities",
  DiaryEntries: "diaryEntries",
  ItineraryActivitiesBatch: "itineraryActivitiesBatch",
  UserTrips: "userTrips"

} as const;
export type CollectionType = typeof CollectionTypes[keyof typeof CollectionTypes];

export const QueueTypes = {
  CREATE_ACTIVITY: "CREATE_ACTIVITY",
  UPDATE_ACTIVITY: "UPDATE_ACTIVITY",
  DELETE_ACTIVITY: "DELETE_ACTIVITY",

  CREATE_ITINERARY: "CREATE_ITINERARY",
  UPDATE_ITINERARY: "UPDATE_ITINERARY",
  DELETE_ITINERARY: "DELETE_ITINERARY",

  CREATE_ITINERARY_ACTIVITY: "CREATE_ITINERARY_ACTIVITY",
  UPDATE_ITINERARY_ACTIVITY: "UPDATE_ITINERARY_ACTIVITY",
  DELETE_ITINERARY_ACTIVITY: "DELETE_ITINERARY_ACTIVITY",
  BATCH_UPDATE_ITINERARY_ACTIVITIES: "BATCH_UPDATE_ITINERARY_ACTIVITIES",

  CREATE_DESTINATION: "CREATE_DESTINATION",
  UPDATE_DESTINATION: "UPDATE_DESTINATION",
  DELETE_DESTINATION: "DELETE_DESTINATION",

  CREATE_PACKAGE: "CREATE_PACKAGE",
  UPDATE_PACKAGE: "UPDATE_PACKAGE",
  DELETE_PACKAGE: "DELETE_PACKAGE",

  CREATE_USER_TRIP: "CREATE_USER_TRIP",
  UPDATE_USER_TRIP: "UPDATE_USER_TRIP",
  DELETE_USER_TRIP: "DELETE_USER_TRIP",

  CREATE_DIARY_ENTRY: "CREATE_DIARY_ENTRY",
  UPDATE_DIARY_ENTRY: "UPDATE_DIARY_ENTRY",
  DELETE_DIARY_ENTRY: "DELETE_DIARY_ENTRY",

  VOTE: "VOTE"

  // Add more as needed
}
export type QueueType = typeof QueueTypes[keyof typeof QueueTypes];


export type Entity =
  Activity | Package | Destination |
  Itinerary | DiaryEntry | UserTrip |
  ItineraryActivity | ItineraryActivitiesBatch;

// Only the entities that support images
export type ImageEntity = Destination | Activity | DiaryEntry | Package ;  //to be added Activity | Package | 

export interface QueuedAction {
  id: string;
  type: string;
  payload: unknown;
  tempId?: string;
}

export interface Day {
  day: number;
  title: string;
  img: string;
  activities: string[];
}

export interface ItineraryActivitiesBatch {
  id?: string,
  itineraryId: string;
  activities: ItineraryActivity[];
}

export interface ImageAttachable {
  imageFile?: File;
  hasImage?: boolean;
  previewBlobUrl? :string;
  isPendingUpload?: boolean;
  focalPointX?: number;
  focalPointY?: number;
}

export interface Activity extends ImageAttachable {
  id?: string;               // Guid → string
  destinationId: string;    // nullable Guid → optional string
  tripId?: string | null;     // nullable Guid → optional string
  name?: string;             // nullable → optional
  details?: string;          // nullable → optional
  linkUrl?:string;          // nullable → optional
  votes?: number;            // nullable int → optional number
  createdBy?: string;        // nullable Guid → optional string
  createdAt?: string;        // nullable DateTime → optional string
  imageUrl?: string;         // nullable → optional
  isPrivate?: boolean;
}

export interface Destination extends ImageAttachable {
  id?: string;
  name: string;
  area?: string;
  country?: string;
  description: string;
  imageUrl?: string;
  createdBy?: string;
  createdAt?: string;
}


export interface DiaryEntry extends ImageAttachable {  //replacing ActivityComment
  id?: string;
  tripId?: string;
  linkedActivityId?: string | null;

  title?: string;
  entryContent?: string;
  imageUrl?: string;
  location?: string;
  dayNumber?: number;
  entryDate?: string; // ISO string
  tags?: string;

  createdBy?: string;
  createdAt?: string; // ISO string

}

export interface Package extends ImageAttachable  {
  id?: string;
  destinationId: string;
  name: string;
  region: string;
  description?: string;
  nights?: number;
  price?: number;
  imageUrl?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface User {
  id?: string,
  name: string,
  email: string,
  avatarUrl: string,
  role: string,
  createdAt?: string
}

export interface UserTrip extends ImageAttachable {
  id?: string;
  userId: string;
  destinationId: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  name?: string;
  notes?: string;
  imageUrl?: string;
  collaborators?: string; // comma-separated emails
}

export interface Itinerary extends ImageAttachable {
  id?: string;
  destinationId: string;
  tripId?: string;
  name: string;
  description?: string; // optional
  slug?: string;        // optional
  tags?: string;        // optional (comma-separated)
  imageUrl?: string;    // optional
  createdBy?: string;
  createdAt?: string;
}

export interface ItineraryActivity {
  id?: string;
  itineraryId: string;
  activityId: string;
  sortOrder?: number;
  notes?: string;
  createdAt?: string;
  createdBy?: string;
}

export interface ResolvedItinerary extends Itinerary {
  activities: Activity[];
}

export interface DashboardActivity {
  id?: string;
  name: string;
  completed?: boolean; // optional, if relevant
}

export interface DashboardItinerary {
  id?: string;
  destinationId: string;
  name?: string;
  description?: string;
  slug?: string;
  tags?: string;
  imageUrl?: string;
  createdBy?: string;
  createdAt?: string;

  // Dashboard-specific fields
  activities?: DashboardActivity[];          // number of activities
  updatedAt?: string;          // last updated timestamp
  role?: "Owner" | "Editor" | "Viewer";
  heroImage?: string;          // optional override for dashboard card
}




