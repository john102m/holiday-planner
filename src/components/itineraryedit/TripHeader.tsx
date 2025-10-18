import React from "react";
//import { useNavigate } from "react-router-dom";
import HeroSection from "../../components/destination/HeroSection";
interface Props {
  tripId: string;
  imageUrl: string;
  name: string;
  notes: string;
}

const TripHeader: React.FC<Props> = ({ imageUrl, name, notes }) => {
  //const navigate = useNavigate();

  return (
    <>
      <HeroSection imageUrl={imageUrl} name={name} description={notes} />
      {/* <div className="mb-4 mt-2">
        <button
          onClick={() => navigate(`/trips/${tripId}`)}
          className="w-28 px-2 py-1 bg-orange-500 text-white rounded text-sm"
        >
          ← Back
        </button>
      </div> */}
    </>
  );
};

export default TripHeader;
