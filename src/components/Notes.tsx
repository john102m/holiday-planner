import React from 'react';

const Notes: React.FC = () => {
    return (
        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 sm:p-6 my-6 text-sm sm:text-base md:text-lg">
            <h5 className="font-semibold mb-2 text-blue-900">Notes:</h5>
            <ul className="list-disc list-inside space-y-1">
                <li><strong>Scooter:</strong> Great for short trips (Caleta ↔ Rosario, Corralejo ferry run, local beaches).</li>
                <li><strong>Car Hire:</strong> Recommended for 3 days to explore north, central, and south.</li>
                <li><strong>Ferry:</strong> Corralejo ↔ Playa Blanca, ~30 min each way, several sailings daily.</li>
                <li><strong>Shops for “the missus”:</strong> Puerto del Rosario (local vibe), Corralejo (touristy & stylish), Caleta promenade (small boutiques), Lanzarote Playa Blanca marina.</li>
            </ul>
        </div>
    );
};

export default Notes;


