// services/initApp.ts
import {
  login,
  getDestinations,
  getPackages,
  getItineraries,
  getActivities,
  getComments,
} from "./api";
import type { Activity, Package, Destination, Itinerary, ActivityComment } from "../services/types";
import { useStore } from "./store";

let initialized = false;

// ✅ Key Changes
// Imported getActivityComments from your API.
// Fetched all comments once during initialization.
// Stored them in useStore keyed by activityId, just like packages/activities/itineraries.
// This makes DestinationPage and other components fully offline-ready for comments
// NB the DOM does NOT like you commandeering the  Comment object so I renamed it ActivityComment

export const initApp = async () => {
  if (initialized) return;
  initialized = true;

  // login (idempotent)
  await login();

  // fetch and store destinations
  const destinations: Destination[] = await getDestinations();
  useStore.getState().setDestinations(destinations);

  // fetch and store packages
  const packages: Package[] = await getPackages();
  const packagesByDest: Record<string, Package[]> = {};
  packages.forEach((p) => {
    if (!p.destinationId) return;
    if (!packagesByDest[p.destinationId]) packagesByDest[p.destinationId] = [];
    packagesByDest[p.destinationId].push(p);
  });
  Object.entries(packagesByDest).forEach(([destId, pkgs]) =>
    useStore.getState().setPackages(destId, pkgs)
  );

  // fetch and store itineraries
  const itineraries: Itinerary[] = await getItineraries();
  const itinerariesByDest: Record<string, Itinerary[]> = {};
  itineraries.forEach((it) => {
    if (!it.destinationId) return;
    if (!itinerariesByDest[it.destinationId]) itinerariesByDest[it.destinationId] = [];
    itinerariesByDest[it.destinationId].push(it);
  });
  Object.entries(itinerariesByDest).forEach(([destId, its]) =>
    useStore.getState().setItineraries(destId, its)
  );

  // fetch and store activities
  const activities: Activity[] = await getActivities();
  const activitiesByDest: Record<string, Activity[]> = {};
  activities
    .filter((a): a is Activity & { destinationId: string } => !!a.destinationId)
    .forEach((a) => {
      if (!activitiesByDest[a.destinationId]) activitiesByDest[a.destinationId] = [];
      activitiesByDest[a.destinationId].push(a);
    });
  Object.entries(activitiesByDest).forEach(([destId, acts]) =>
    useStore.getState().setActivities(destId, acts)
  );

  // fetch and store all ActivityComments
  const comments: ActivityComment[] = await getComments();
  const commentsByActivity: Record<string, ActivityComment[]> = {};
  comments.forEach((c) => {
    if (!c.activityId) return;
    if (!commentsByActivity[c.activityId]) commentsByActivity[c.activityId] = [];
    commentsByActivity[c.activityId].push(c);
  });
  Object.entries(commentsByActivity).forEach(([activityId, comms]) =>
    useStore.getState().setComments(activityId, comms)
  );
};
