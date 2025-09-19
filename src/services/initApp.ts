// services/initApp.ts

// ✅ Key points:
// Hydrate first: ensures localForage data is available even if network is patchy.
// Set each slice individually: keeps your store reactive.
// Queue flush: ensures offline actions automatically attempt once online.
// Seamless offline/online: combined with your window.addEventListener("online", …) listener, any network restoration will auto-process further queued actions.

// Store slices = in-memory representation of your app’s main entities (destinations, trips, activities…).
// localForage = local disk cache, so the app can work offline.
// Queue = “to-do list” for anything the user does while offline.
// processQueue = sweeps through that to-do list when the network comes back.
// Components = just read/write the store as if it’s the database — everything else happens behind the

import { login, getUserTrips } from "./apis/api";
import { getDestinations } from "./apis/destinationsApi";
import { getActivities } from "./apis/activitiesApi";
import { getPackages } from "./apis/packagesApi";
import { getItineraries, getItineraryActivities, } from "./apis/itinerariesApi";
import { getAllDiaryEntries } from "./apis/diaryEntryApi";

import type { Activity, Package, Destination, Itinerary, ItineraryActivity, UserTrip } from "./types";
import { useStore, processQueue } from "./store";
import { useActivitiesStore, } from "./slices/activitiesSlice";
import { usePackageStore, } from "./slices/packagesSlice";
import { useItinerariesStore, } from "./slices/itinerariesSlice";
import { useDestinationsStore, } from "./slices/destinationsSlice";
import { useDiaryEntriesStore } from "./slices/diaryEntriesSlice";

let initialized = false;



export function resetAllStores() {
  localStorage.removeItem("holiday-planner-store");
  localStorage.removeItem("activities-store");
  localStorage.removeItem("packages-store");
  localStorage.removeItem("itineraries-store");
  localStorage.removeItem("diary-entries-store");
  localStorage.removeItem("destinations-store");
  window.location.reload();
}


export const initApp = async () => {
  if (initialized) return;
  initialized = true;

  // login (idempotent)
  await login();

  // Uncomment this during testing to wipe persisted store
  const RESET_STORE = false;

  if (RESET_STORE) {
    resetAllStores();
  }



  // Hydrate store from localForage first
  await useStore.getState().hydrate();


  // Fetch and store destinations
  const destinations: Destination[] = await getDestinations();
  useDestinationsStore.getState().setDestinations(destinations);

  // Fetch and store packages
  const packages: Package[] = await getPackages();
  console.log("Packages fetched: ",packages);
  const packagesByDest: Record<string, Package[]> = {};
  packages.forEach((p) => {
    if (!p.destinationId) return;
    if (!packagesByDest[p.destinationId]) packagesByDest[p.destinationId] = [];
    packagesByDest[p.destinationId].push(p);
  });
  Object.entries(packagesByDest).forEach(([destId, pkgs]) =>
    usePackageStore.getState().setPackages(destId, pkgs)
  );

  // Fetch and store itineraries
  const itineraries: Itinerary[] = await getItineraries();
  const itinerariesByDest: Record<string, Itinerary[]> = {};
  itineraries.forEach((it) => {
    if (!it.destinationId) return;
    if (!itinerariesByDest[it.destinationId]) itinerariesByDest[it.destinationId] = [];
    itinerariesByDest[it.destinationId].push(it);
  });
  Object.entries(itinerariesByDest).forEach(([destId, its]) =>
    useItinerariesStore.getState().setItineraries(destId, its)
  );

  // Fetch and store activities
  const activities: Activity[] = await getActivities();
  const activitiesByDest: Record<string, Activity[]> = {};
  activities
    .filter((a): a is Activity & { destinationId: string } => !!a.destinationId)
    .forEach((a) => {
      if (!activitiesByDest[a.destinationId]) activitiesByDest[a.destinationId] = [];
      activitiesByDest[a.destinationId].push(a);
    });
  Object.entries(activitiesByDest).forEach(([destId, acts]) =>
    useActivitiesStore.getState().setActivities(destId, acts)
  );


  // Fetch and store itinerary-activity relationships
  const itineraryActivities: ItineraryActivity[] = await getItineraryActivities();
  console.log("fetched itinerary-activity relationships", itineraryActivities);
  const joinsByItinerary: Record<string, ItineraryActivity[]> = {};
  itineraryActivities.forEach((join) => {
    if (!join.itineraryId) return;
    if (!joinsByItinerary[join.itineraryId]) joinsByItinerary[join.itineraryId] = [];
    joinsByItinerary[join.itineraryId].push(join);
  });
  useItinerariesStore.setState({ itineraryActivities: {} });

  Object.entries(joinsByItinerary).forEach(([itinId, joins]) => {
    const sortedJoins = joins.slice().sort((a, b) => a.sortOrder! - b.sortOrder!);
    useItinerariesStore.getState().setItineraryActivities(itinId, sortedJoins);
  });

  console.log("joined itinerary-activity relationships", joinsByItinerary);

  // Fetch and store userTrips
  const userId = "1AA26F2F-C41C-4F82-B07A-380E2992BFD9"; // replace with actual logged-in user id
  const trips: UserTrip[] = await getUserTrips(userId);
  useStore.getState().setUserTrips(trips);

  // Fetch and store diary entries 
  const diaryEntries = await getAllDiaryEntries();
  //const diaryEntries = await getDiaryEntriesByUser(userId);
  console.log("diaryEntries", diaryEntries)
  useDiaryEntriesStore.getState().setDiaryEntries(diaryEntries);

  // Process any queued actions from previous offline sessions
  await processQueue();
};
