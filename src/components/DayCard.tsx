import React from 'react';

import type { Day } from '../types';

const DayCard: React.FC<Day> = ({ day,title, img, activities }) => {
  return (
  <div className="shadow-sm mb-6 rounded-lg overflow-hidden flex flex-col">
    <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 overflow-hidden">
      <img
        src={img}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105 hover:brightness-105"
      />
    </div>
    <div className="p-4 flex flex-col flex-1">
      <h5 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2">Day {day} - {title}</h5>
      <ul className="list-disc list-inside text-sm sm:text-base md:text-lg flex-1">
        {activities.map((act, i) => (
          <li key={i}>{act}</li>
        ))}
      </ul>
    </div>
  </div>
  );
};

export default DayCard;


