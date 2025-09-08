// packageSlice.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Package, QueuedAction } from "../types";
import { createPackage, editPackage, deletePackage } from "../apis/packagesApi";
export interface PackageSliceState {
    packages: Record<string, Package[]>;

    // CRUD
    setPackages: (destId: string, pkgs: Package[]) => void;
    addPackage: (destId: string, pkg: Package) => void;
    updatePackage: (destId: string, pkg: Package) => void;
    replacePackage: (tempId: string, saved: Package) => void;
    removePackage: (destId: string, packageId: string) => void;
    getPackages: (destId?: string) => Package[];
}

console.log("🔥 packagesSlice.ts loaded — check new import resolution");

export const usePackageStore = create<PackageSliceState>()(
    persist(
        (set, get) => ({
            packages: {},

            setPackages: (destId, pkgs) => //Overwrites all packages for a given destination
                set((state) => ({
                    packages: { ...state.packages, [destId]: pkgs },
                })),

            addPackage: (destId, pkg) => //Appends a new package to the destination’s list
                set((state) => ({
                    packages: {
                        ...state.packages,
                        [destId]: [...(state.packages[destId] || []), pkg],
                    },
                })),

            updatePackage: (destId: string, pkg: Package) => //Finds a package by ID and updates it
                set((state) => {
                    const existing = state.packages[destId] || [];
                    const updatedList = existing.map((p) =>
                        p.id === pkg.id ? { ...p, ...pkg } : p
                    );
                    return {
                        packages: { ...state.packages, [destId]: updatedList },
                    };
                }),

            replacePackage: (tempId, saved) => //Replaces a package with a temporary ID (used after creation)
                set((state) => {
                    const updated = Object.entries(state.packages).reduce(
                        (acc, [destId, pkgs]) => {
                            acc[destId] = pkgs.map((p) => (p.id === tempId ? saved : p));
                            return acc;
                        },
                        {} as Record<string, Package[]>
                    );
                    return { packages: updated };
                }),

            removePackage: (destId, packageId) =>//Removes a package by ID from the destination’s list
                set((state) => ({
                    packages: {
                        ...state.packages,
                        [destId]: state.packages[destId]?.filter((p) => p.id !== packageId),
                    },
                })),

            getPackages: (destId) => { //Returns all packages, or those for a specific destination
                if (destId) return get().packages[destId] || [];
                return Object.values(get().packages).flat();
            },
        }),
        {//Wraps the store so its state is saved to localStorage under the key "packages-store"
            name: 'packages-store',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export const handleCreatePackage = async (action: QueuedAction) => {
    const { replacePackage, addPackage } = usePackageStore.getState();
    const pkg = action.payload as Package;
    const saved = await createPackage(pkg); // your backend call
    if (action.tempId) replacePackage(action.tempId, saved);
    else addPackage(saved.destinationId!, saved);
};

export const handleUpdatePackage = async (action: QueuedAction) => {
    const { updatePackage } = usePackageStore.getState();
    const pkg = action.payload as Package;
    if (!pkg.id) throw new Error("Cannot update package: missing ID");
    await editPackage(pkg.id, pkg);
    updatePackage(pkg.destinationId!, pkg);
};

export const handleDeletePackage = async (action: QueuedAction) => {
    const { removePackage } = usePackageStore.getState();
    const pkg = action.payload as Package;
    if (!pkg.id) throw new Error("Cannot delete package: missing ID");
    await deletePackage(pkg.id);
    removePackage(pkg.destinationId!, pkg.id);
};

