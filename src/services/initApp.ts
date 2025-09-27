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

import type { Activity, Package, Itinerary, ItineraryActivity, Destination, UserTrip, DiaryEntry } from "./types";
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
}export const initApp = async () => {
  if (initialized) return;
  initialized = true;

  await login();

  const RESET_STORE = false;
  if (RESET_STORE) resetAllStores();

  // Hydrate root store manually (slices auto-hydrate via persist)
  await useStore.getState().hydrate();

  const userId = "1AA26F2F-C41C-4F82-B07A-380E2992BFD9";

  // Fetch everything fresh in parallel
  const [
    destinationsResult,
    packagesResult,
    itinerariesResult,
    activitiesResult,
    itineraryActivitiesResult,
    tripsResult,
    diaryEntriesResult
  ] = await Promise.allSettled([
    getDestinations(),
    getPackages(),
    getItineraries(),
    getActivities(),
    getItineraryActivities(),
    getUserTrips(userId),
    getAllDiaryEntries()
  ]);

  // Helper to unwrap safely
  const unwrap = <T>(res: PromiseSettledResult<T>, fallback: T): T =>
    res.status === "fulfilled" ? res.value : fallback;

  // Destinations
  useDestinationsStore.getState().setDestinations(
    unwrap(destinationsResult, [] as Destination[])
  );

  // Packages
  const packages = unwrap(packagesResult, [] as Package[]);
  const packagesByDest: Record<string, Package[]> = {};
  packages.forEach((p) => {
    if (!p.destinationId) return;
    (packagesByDest[p.destinationId] ||= []).push(p);
  });
  Object.entries(packagesByDest).forEach(([destId, pkgs]) =>
    usePackageStore.getState().setPackages(destId, pkgs)
  );

  // Itineraries
  const itineraries = unwrap(itinerariesResult, [] as Itinerary[]);
  const itinerariesByDest: Record<string, Itinerary[]> = {};
  itineraries.forEach((it) => {
    if (!it.destinationId) return;
    (itinerariesByDest[it.destinationId] ||= []).push(it);
  });
  Object.entries(itinerariesByDest).forEach(([destId, its]) =>
    useItinerariesStore.getState().setItineraries(destId, its)
  );

  // Activities
  const activities = unwrap(activitiesResult, [] as Activity[]);
  const activitiesByDest: Record<string, Activity[]> = {};
  activities
    .filter((a): a is Activity & { destinationId: string } => !!a.destinationId)
    .forEach((a) => {
      (activitiesByDest[a.destinationId] ||= []).push(a);
    });
  Object.entries(activitiesByDest).forEach(([destId, acts]) =>
    useActivitiesStore.getState().setActivities(destId, acts)
  );

  // Itinerary-activity joins
  const itineraryActivities = unwrap(itineraryActivitiesResult, [] as ItineraryActivity[]);
  const joinsByItinerary: Record<string, ItineraryActivity[]> = {};
  itineraryActivities.forEach((join) => {
    if (!join.itineraryId) return;
    (joinsByItinerary[join.itineraryId] ||= []).push(join);
  });
  useItinerariesStore.setState({ itineraryActivities: {} });
  Object.entries(joinsByItinerary).forEach(([itinId, joins]) => {
    const sorted = joins.slice().sort((a, b) => a.sortOrder! - b.sortOrder!);
    useItinerariesStore.getState().setItineraryActivities(itinId, sorted);
  });

  // Trips
  useStore.getState().setUserTrips(
    unwrap(tripsResult, [] as UserTrip[])
  );

  // Diary entries
  useDiaryEntriesStore.getState().setDiaryEntries(
    unwrap(diaryEntriesResult, [] as DiaryEntry[])
  );

  // Process offline queue
  await processQueue();
};

