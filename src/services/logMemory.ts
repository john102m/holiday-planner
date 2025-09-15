// utils/logMemory.ts
import { useActivitiesStore } from "../services/slices/activitiesSlice";
import { useItinerariesStore} from "../services/slices/itinerariesSlice"
import { useDestinationsStore} from "../services/slices/destinationsSlice"
import { useDiaryEntriesStore } from "./slices/diaryEntriesSlice";
import { useStore } from "../services/store";

// Rough size in bytes via JSON
const roughSize = (obj: unknown): number => {
    try {
        return new Blob([JSON.stringify(obj)]).size;
    } catch {
        return 0;
    }
};

export const logMemory = () => {
    const activitiesState = useActivitiesStore.getState();
    const itinerariesState = useItinerariesStore.getState();
    const destinationsState = useDestinationsStore.getState();
    const diaryEntriesState = useDiaryEntriesStore.getState();

    const state = useStore.getState();


    // Store sizes
    console.log("📦 Store snapshot:");
    console.log("  Destinations:", destinationsState.destinations.length);
    console.log("  DiaryEntries:", diaryEntriesState.diaryEntries.length);

    console.log("  UserTrips:", state.userTrips.length);
    console.log(
        "  Activities (total):",
        Object.values(activitiesState.activities).flat().length
    );
    console.log("  Packages:", Object.values(state.packages).flat().length);
    console.log("  Itineraries:", Object.values(itinerariesState.itineraries).flat().length);
    console.log("  Queue length:", state.queue.length);

    console.log("💾 Rough store size:", roughSize(state), "bytes");

    // JS heap info (Chrome only)
    const perf = performance as Performance & {
        memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
        };
    };

    if (perf.memory) {
        console.log("🧠 JS heap used:", perf.memory.usedJSHeapSize, "bytes");
        console.log("  Total JS heap:", perf.memory.totalJSHeapSize, "bytes");
        console.log("  Heap limit:", perf.memory.jsHeapSizeLimit, "bytes");
    }
};
