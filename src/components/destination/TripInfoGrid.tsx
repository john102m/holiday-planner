import React from "react";
import { useTripInfoStore } from "../../services/slices/tripInfoSlice";
import type { TripInfo } from "../../services/types";
import TripInfoCard from "../cards/TripInfoCard";
import ErrorToast from "../../components/common/ErrorToast";

interface Props {
    tripId: string;
}

const empty: TripInfo[] = [];

const TripInfoGrid: React.FC<Props> = ({ tripId }) => {
    const { errorMessage, setError } = useTripInfoStore();

    const tripInfoList = useTripInfoStore((state) => state.tripInfoList ?? empty);
    const filteredTripInfo = tripInfoList.filter((info) => info.tripId === tripId);


    if (tripInfoList.length === 0) return <div>No trip info added yet.</div>;

    console.log("TripInfo entries:", filteredTripInfo.length);
    console.log("Trip Id:", tripId);

    return (
        <>
            <div className="w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 items-stretch">
                    {filteredTripInfo.map((info) => (
                        <TripInfoCard
                            key={info.id}
                            info={info}
                            tripId={tripId}
                            showActions={true}
                        />
                    ))}
                </div>
            </div>

            <ErrorToast errorMessage={errorMessage} onClose={() => setError(null)} />
        </>
    );
};

export default TripInfoGrid;
