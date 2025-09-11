import type { Destination } from "../../services/types";

interface Props {
  destination: Destination;
}

export default function DestinationHero({ destination }: Props) {
  return (
    <header
      className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] bg-center bg-cover flex items-center justify-center"
      style={{
        backgroundImage: `url('${destination.imageUrl || 'https://myjohnblogimages.blob.core.windows.net/images/fuerteventura.webp'}')`,
      }}
    >
      <div className="bg-black/40 p-6 rounded-xl text-center max-w-xl mx-4">
        <h1
          className="text-white font-bold leading-tight"
          style={{ fontSize: "clamp(1.5rem, 5vw, 2.8rem)" }}
        >
          {destination.name || "Destination"}
        </h1>
      </div>
    </header>
  );
}
