
# Activity Filtering Flow

This diagram shows how itineraries, destinations, and activities relate, and why we need `.flat()` + a lookup map to get `availableActivities`.



## Notes

1. **Itineraries**: grouped by trip and contain a `destinationId`.  
2. **Activities store**: nested arrays per `destinationId`.  
3. **Flattening**: `.flat()` collapses all nested activity arrays into a single array for easier filtering.  
4. **Lookup map**: `flatActivitiesById` allows O(1) access by `activityId` when showing linked activities or previews.  
5. **Filtering**: `availableActivities` excludes already linked activities for that itinerary and matches the itinerary's `destinationId`.






# Full Activity Filtering Flow (ASCII Diagram)

Trip
└─▶ Itineraries[]
     ├─ Itinerary 1 (id: abc123)
     │    └─ destinationId: 2e499e55-a53d-46b8-9bf0-0366e43ded2e
     │
     └─ Itinerary 2 (id: def456)
          └─ destinationId: da9a83d7-7bff-4915-8888-3604f026257b

Activities Store (grouped by destinationId)
┌───────────────────────────────┐
│ destinationId: 2e499e55-a53d │
│ ├─ Activity A                 │
│ ├─ Activity B                 │
│ └─ Activity C                 │
│                               │
│ destinationId: da9a83d7-7bff │
│ ├─ Activity D                 │
│ ├─ Activity E                 │
│ └─ Activity F                 │
└───────────────────────────────┘

Flattened lookup (flatActivitiesById)
┌───────────────┐
│ activityId → Activity │
└───────────────┘
Allows O(1) access when rendering linked activities or previewing selection.

Available Activities for current itinerary
┌───────────────────────────────┐
│ Filtered:                     │
│ - Matches itinerary.destinationId │
│ - Not already linked in joins │
└───────────────────────────────┘
This drives the dropdown in LinkedActivitiesPanel for adding new activities.


Trip
 ├── Itinerary A  (edit = metadata: name, description, cover image, tags)
 │     ├── Activity 1  (edit = details inside itinerary: reorder, notes, delete)
 │     ├── Activity 2
 │     └── Activity 3
 │
 └── Itinerary B
       ├── Activity 1
       └── Activity 2

