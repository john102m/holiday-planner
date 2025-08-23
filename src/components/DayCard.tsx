import React from 'react';
import type { Day } from '../types';

const DayCard: React.FC<Day> = ({ day, title, img, activities }) => (
  <div className="shadow-sm mb-8 overflow-hidden rounded-lg">
    <img
      src={img}
      alt={title}
      className="w-full h-[250px] object-cover transition-transform duration-300 ease-in-out hover:scale-105 hover:brightness-105"
    />
    <div className="p-4">
      <h5 className="text-xl font-semibold mb-2">{title}</h5>
      <ul className="list-disc list-inside">
        {activities.map((act, i) => (
          <li key={i}>{act}</li>
        ))}
      </ul>
    </div>
  </div>
);

export default DayCard;

