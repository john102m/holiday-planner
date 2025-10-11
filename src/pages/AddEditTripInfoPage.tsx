import { useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTripInfoStore } from "../services/slices/tripInfoSlice";
import { useAddEditWithImage } from "../components/common/useAddEditWithImage";
import TripInfoForm from "../components/forms/TripInfoForm";
import { CollectionTypes, QueueTypes } from "../services/types";
import type { TripInfo } from "../services/types";

const AddEditTripInfoPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const tripInfoId = searchParams.get("tripInfoId") ?? undefined;
    const tripId = searchParams.get("tripId") ?? "";
    const navigate = useNavigate();

    const { tripInfo } = useTripInfoStore();
    const tripInfos = useMemo(() => tripInfo[tripId] ?? [], [tripInfo, tripId]);

    const currentInfo = useMemo(() => {
        return tripInfos.find(info => info.id === tripInfoId);
    }, [tripInfos, tripInfoId]);

    const { handleImageSelection, handleSubmit } = useAddEditWithImage(CollectionTypes.TripInfo);

    const onSubmit = async (formValues: TripInfo) => {
        const queueType = tripInfoId ? QueueTypes.UPDATE_TRIP_INFO : QueueTypes.CREATE_TRIP_INFO;
        const payload = { ...formValues, tripId };

        const tempId = await handleSubmit(payload, queueType, tripId);
        console.log("✅ TripInfo queued with temp ID:", tempId);
        navigate(`/trips/${tripId}`);
    };

    if (!tripId || (tripInfoId && !currentInfo)) {
        return <div>Loading trip info...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">
                {currentInfo ? "Edit Trip Info" : "Add Trip Info"}
            </h2>
            <TripInfoForm
                initialValues={currentInfo}
                tripId={tripId}
                onSubmit={onSubmit}
                onCancel={() => navigate(`/trips/${tripId}`)}
                onImageSelect={handleImageSelection}
            />
        </div>
    );
};

export default AddEditTripInfoPage;
