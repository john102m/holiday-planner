import { useEffect, useRef, useState } from "react";
import { login, getDestinations } from "../services/api";  // your Axios wrapper
import type { Destination } from "../types";
import DestinationCard from "../components/DestinationCard";
import Hero from "../components/Hero";

const Home: React.FC = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false); // ✅ track first fetch
  useEffect(() => {
    if (hasFetched.current) return; // skip if already ran
    hasFetched.current = true;

    const init = async () => {
      try {
        console.log("Starting login and fetch process");
        // Step 1: login with hardcoded credentials
        await login();

        // Step 2: fetch destinations (token is now in localStorage / axios interceptors)
        const data = await getDestinations();
        setDestinations(data);
      } catch (err) {
        console.error("Failed to fetch destinations", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <>
    <Hero/>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map(dest => (
          <DestinationCard key={dest.id} destination={dest} />
        ))}
      </div>
    </div>
    </>
  );
};

export default Home;

