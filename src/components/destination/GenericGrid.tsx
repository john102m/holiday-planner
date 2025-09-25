//import React from "react";
// import type { GenericEntity } from "../../services/types";
// import GenericCard from "../cards/GenericCard";
// import ErrorToast from "../../components/common/ErrorToast";
// import { useTripEntitiesStore } from "../../services/slices/tripEntitiesSlice";

// interface Props {
//   tripId?: string;
//   type?: GenericEntity["type"]; // optional filter by type
// }

// const empty: GenericEntity[] = [];

// const GenericGrid: React.FC<Props> = ({ tripId, type }) => {
//   const { entities, errorMessage, setError } = useTripEntitiesStore();
//   const allEntities = entities ?? empty;

//   const filtered = allEntities.filter((e) =>
//     (!tripId || e.tripId === tripId) &&
//     (!type || e.type === type)
//   );

  //if (filtered.length === 0) return <div>No items yet.</div>;

//   return (
//     <>
//       <div className="flex justify-center">
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 items-stretch">
//           {/* {filtered.map((entity) => (
//             <GenericCard
//               key={entity.id}
//               entity={entity}
//               showActions={!!tripId}
//             />
//           ))} */}
//         </div>
//       </div>
//       <ErrorToast errorMessage={errorMessage} onClose={() => setError(null)} />
//     </>
//   );
// };

// export default GenericGrid;
