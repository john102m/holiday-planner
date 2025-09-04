// utils/logMemory.ts
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
    const state = useStore.getState();

    // Store sizes
    console.log("📦 Store snapshot:");
    console.log("  Destinations:", state.destinations.length);
    console.log("  UserTrips:", state.userTrips.length);
    console.log(
        "  Activities (total):",
        Object.values(state.activities).flat().length
    );
    console.log("  Packages:", Object.values(state.packages).flat().length);
    console.log("  Itineraries:", Object.values(state.itineraries).flat().length);
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
