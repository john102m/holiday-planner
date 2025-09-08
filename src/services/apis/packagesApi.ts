
import type { Package } from "../types";
import { api } from "../apis/api"

// Fetch all packages
export const getPackages = async (): Promise<Package[]> => {
    const res = await api.get<Package[]>("/packages");
    return res.data;
};

// Fetch a package by ID
export const getPackageById = async (id: string): Promise<Package> => {
    const res = await api.get<Package>(`/packages/${id}`);
    return res.data;
};

// Fetch all packages for a specific destination
export const getPackagesByDestination = async (destId: string): Promise<Package[]> => {
    const res = await api.get<Package[]>(`/packages/destination/${destId}`);
    return res.data;
};

// Create a new package
export const createPackage = async (payload: Package): Promise<Package> => {
    const res = await api.post<Package>("/packages/create", payload);
    return res.data;
};

// Update an existing package
export const editPackage = async (packageId: string, data: Package): Promise<void> => {
    await api.post(`/packages/update/${packageId}`, data);
};

// Delete a package
export const deletePackage = async (packageId: string): Promise<void> => {
    await api.post(`/packages/delete/${packageId}`);
};

