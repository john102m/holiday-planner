import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useItinerariesStore } from "../services/slices/itinerariesSlice";
import ItineraryForm from "../components/forms/ItineraryForm";
import type { Itinerary } from "../services/types";
import { QueueTypes, CollectionTypes } from "../services/types";
import { useAddEditWithImage } from "../components/common/useAddEditWithImage";

const AddEditItineraryPage: React.FC = () => {
    const { itineraryId } = useParams<{ itineraryId: string }>();
    const { handleImageSelection, handleSubmit } = useAddEditWithImage<Itinerary>(CollectionTypes.Itineraries);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const tripId = searchParams.get("tripId") ?? "";
    const destId = searchParams.get("destId") ?? "";

    const navigate = useNavigate();
    const isEditMode = Boolean(itineraryId);

    const rawItineraries = useItinerariesStore(state => state.itineraries);
    const allItineraries = useMemo(() => Object.values(rawItineraries).flat(), [rawItineraries]);

    const currentItinerary = useMemo(() => {
        if (!isEditMode) return undefined;
        return allItineraries.find(it => it.id === itineraryId);
    }, [isEditMode, allItineraries, itineraryId]);

    const destinationId = currentItinerary?.destinationId ?? destId;
    const memoizedInitialValues = useMemo(() => currentItinerary, [currentItinerary]);

    // --- Local preview state ---
    const [previewUrl, setPreviewUrl] = useState(currentItinerary?.imageUrl);

    // --- Wrap hook to manage preview + revoke previous blob ---
    const handleSelectImage = async (file: File) => {
        const newPreview = await handleImageSelection(file);

        if (previewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(newPreview);
        return newPreview;
    };

    // --- Cleanup on unmount ---
    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const onSubmit = async (updated: Itinerary) => {
        const sanitizedItinerary: Itinerary = {
            ...updated,
            name: updated.name ?? "",
            description: updated.description ?? "",
            tripId,
            slug: updated.slug ?? "",
            imageUrl: updated.imageUrl ?? "",
            tags: Array.isArray(updated.tags) ? updated.tags.join(", ") : updated.tags ?? "",
            destinationId: updated.destinationId ?? destId
        };

        const queueType = isEditMode ? QueueTypes.UPDATE_ITINERARY : QueueTypes.CREATE_ITINERARY;

        const tempId = await handleSubmit(sanitizedItinerary, queueType, destinationId);
        console.log("✅ Itinerary queued with temp ID:", tempId);

        navigate(`/destinations/${destinationId}`);
    };

    return (
        <div className="container mx-auto p-4">
            <div className="mt-6 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Edit' : 'Create'} Itinerary</h2>
                <ItineraryForm
                    initialValues={memoizedInitialValues}
                    destinationId={destinationId}
                    onSubmit={onSubmit}
                    onCancel={() => navigate(`/itineraries/view/${destinationId}/${itineraryId}`)}
                    onImageSelect={handleSelectImage}
                />
            </div>
        </div>
    );
};

export default AddEditItineraryPage;
