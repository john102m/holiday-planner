import React from 'react';

import type { Day } from '../types';

const DayCard: React.FC<Day> = ({ title, img, activities }) => {
  return (
    <div className="shadow-sm mb-6 overflow-hidden rounded-lg">
      <img
        src={img}
        alt={title}
        className="w-full h-48 sm:h-56 md:h-64 object-cover transition-transform duration-300 ease-in-out hover:scale-105 hover:brightness-105"
      />
      <div className="p-3 sm:p-4">
        <h5 className="text-lg sm:text-xl font-semibold mb-2">{title}</h5>
        <ul className="list-disc list-inside text-sm sm:text-base">
          {activities.map((act, i) => (
            <li key={i}>{act}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DayCard;


