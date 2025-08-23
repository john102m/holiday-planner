import React from 'react';

const Notes: React.FC = () => (
  <div className="bg-blue-200 border-l-4 border-blue-400 p-4 rounded-lg mb-8">
    <h5 className="font-semibold mb-2">Notes:</h5>
    <ul className="list-disc list-inside">
      <li><strong>Scooter:</strong> Great for short trips (Caleta ↔ Rosario, Corralejo ferry run, local beaches).</li>
      <li><strong>Car Hire:</strong> Recommended for 3 days to explore north, central, and south.</li>
      <li><strong>Ferry:</strong> Corralejo ↔ Playa Blanca, ~30 min each way, several sailings daily.</li>
      <li><strong>Shops for “the missus”:</strong> Puerto del Rosario (local vibe), Corralejo (touristy & stylish), Caleta promenade (small boutiques), Lanzarote Playa Blanca marina.</li>
    </ul>
  </div>
);

export default Notes;

