import React, { useEffect, useState } from "react";
import type { Itinerary } from "../../services/types";
import { getUserByEmail } from "../../services/apis/api";
import { getItineraries } from "../../services/apis/itinerariesApi";
import InvitationCard from "../InvitationCard"; // adjust path as needed

interface Invitation {
    itinerary: Itinerary;
    role: string;
    status: "pending" | "accepted" | "declined";
}

const InvitationsSection: React.FC = () => {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInvitations = async () => {
            setLoading(true);
            setError(null);

            try {
                const allItineraries = await getItineraries();
                const user = await getUserByEmail("john@test.com"); // replace with actual user email from auth context
                //console.log("Fetched user:", user);
                const currentUserId = user?.id;//"f3a9c1d2-7e4b-4b6a-9f2e-8c3e1a2d9b7f"; // replace with auth context

                const invites: Invitation[] = allItineraries
                    .filter((it) => it.createdBy !== currentUserId)
                    .map((it) => ({
                        itinerary: it,
                        role: "Viewer",
                        status: "pending",
                    }));

                setInvitations(invites);
            } catch (err) {
                console.error("Failed to fetch invitations", err);
                setError("Failed to load invitations.");
            } finally {
                setLoading(false);
            }
        };

        fetchInvitations();
    }, []);

    const handleAccept = (id: string) => {
        setInvitations((prev) =>
            prev.map((inv) =>
                inv.itinerary.id === id ? { ...inv, status: "accepted" } : inv
            )
        );
    };

    const handleDecline = (id: string) => {
        setInvitations((prev) =>
            prev.map((inv) =>
                inv.itinerary.id === id ? { ...inv, status: "declined" } : inv
            )
        );
    };

    if (loading) return <p>Loading invitations...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (invitations.length === 0) return <p className="text-gray-500">No pending invitations.</p>;

    return (
        <section>

            <h2 className="section-heading">
                <span className="section-heading-accent">Invitations & Shared Trips</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {invitations.map((inv) => (
                    <InvitationCard
                        key={inv.itinerary.id}
                        invitation={inv}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                    />
                ))}
            </div>
        </section>
    );
};

export default InvitationsSection;
