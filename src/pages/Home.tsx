
import Hero from '../components/Hero';
import DayCard from '../components/DayCard';
import Notes from '../components/Notes';
import type { Day } from '../types';

const days: Day[] = [
  {
    day: 1,
    title: "Arrival & Settle In",
    img: "https://myjohnblogimages.blob.core.windows.net/images/Caleta.webp",
    activities: [
      "Arrive at hotel, check-in, relax after flight.",
      "Gentle walk along Caleta de Fuste promenade.",
      "Dinner nearby or at hotel."
    ]
  },
  {
    day: 2,
    title: "Local Exploration (Scooter)",
    img: "https://myjohnblogimages.blob.core.windows.net/images/PuertoRosario.webp",
    activities: [
      "Morning: Explore Caleta de Fuste marina and small shops.",
      "Afternoon: Ride scooter to Puerto del Rosario (20 min). Visit local shops, markets, and enjoy a coffee.",
      "Evening: Sunset back at the hotel."
    ]
  },
  {
    day: 3,
    title: "Scenic North Trip (Car Hire)",
    img: "https://myjohnblogimages.blob.core.windows.net/images/elcotillo.webp",
    activities: [
      "Collect hire car for 2–3 days.",
      "Drive north to El Cotillo. Explore lagoons and craft shops, lunch in a local seafood restaurant.",
      "Continue to Corralejo for shopping and sand dunes.",
      "Return via inland scenic route."
    ]
  },
  {
    day: 4,
    title: "Central Culture (Car Hire)",
    img: "https://myjohnblogimages.blob.core.windows.net/images/Betancuria.webp",
    activities: [
      "Visit Betancuria (historic capital). Whitewashed streets, small craft shops, church.",
      "Stop at Mirador Morro Velosa for views.",
      "Afternoon coffee in Pájara village.",
      "Dinner back in Caleta de Fuste."
    ]
  },
  {
    day: 5,
    title: "Beach & Relax (Car Hire)",
    img: "https://myjohnblogimages.blob.core.windows.net/images/sotaventobeach.webp",
    activities: [
      "Head south to Sotavento Beach (Jandía Peninsula). Famous wide sandy beach, windy but spectacular.",
      "Swim and relax (check tide for lagoons).",
      "Return car in evening."
    ]
  },
  {
    day: 6,
    title: "Local Leisure (Scooter)",
    img: "https://myjohnblogimages.blob.core.windows.net/images/hotel.webp",
    activities: [
      "Morning spa time at Sheraton.",
      "Afternoon scooter ride to small local beaches near Caleta.",
      "Explore shops, relax at marina.",
      "Optional evening tapas."
    ]
  },
  {
    day: 7,
    title: "Day Trip to Lanzarote (Scooter + Ferry)",
    img: "https://myjohnblogimages.blob.core.windows.net/images/PlayaBlanca.webp",
    activities: [
      "Morning scooter ride to Corralejo.",
      "Ferry (30 mins) to Playa Blanca, Lanzarote. Explore marina, shops, promenade.",
      "Lunch by the sea.",
      "Return ferry & scooter back."
    ]
  },
  {
    day: 8,
    title: "Windy Beach Adventure (Scooter)",
    img: "https://myjohnblogimages.blob.core.windows.net/images/PozoNegro.webp",
    activities: [
      "Scooter ride to Pozo Negro or another quieter local beach.",
      "Enjoy contrast with hotel’s calm setting.",
      "Evening stroll around Caleta."
    ]
  },
  {
    day: 9,
    title: "Mix & Match",
    img: "https://myjohnblogimages.blob.core.windows.net/images/PuertoRosario.webp",
    activities: [
      "Morning pool/spa time.",
      "Afternoon return to Puerto del Rosario for more shopping.",
      "Evening sunset dinner."
    ]
  },
  {
    day: 10,
    title: "Departure",
    img: "https://myjohnblogimages.blob.core.windows.net/images/Souvenir.webp",
    activities: [
      "Final swim in hotel pool or beach dip.",
      "Souvenir shopping in Caleta de Fuste.",
      "Check-out and transfer to airport."
    ]
  }
];

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <Hero />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {days.map(day => (
          <DayCard key={day.day} {...day} />
        ))}
      </div>
      <Notes />
      <footer className="text-center py-4 mt-6 border-t text-sm sm:text-base">
        © 2025 Fuerteventura Itinerary | Designed for fun & travel
      </footer>
    </div>
  );
};

export default Home;
