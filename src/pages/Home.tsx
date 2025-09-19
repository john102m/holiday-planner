import React, { useEffect, useState } from "react";
import { useDestinationsStore } from "../services/slices/destinationsSlice";
import { initApp } from "../services/initApp";
import DestinationCard from "../components/destination/DestinationCard";
import Hero from "../components/Hero";
import ScrollToTopButton from "../components/ScrollToTop";
import {inspectRoles} from "../services/auth"

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const destinations = useDestinationsStore((state) => state.destinations);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await initApp(); // handles login + fetching + storing in Zustand
      } catch (err) {
        console.error("Failed to initialize app", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  inspectRoles();

  return (
    <>
      <Hero />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
        <ScrollToTopButton />
      </div>
    </>
  );
};

export default Home;
