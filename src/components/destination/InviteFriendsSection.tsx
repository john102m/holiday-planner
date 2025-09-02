// components/destination/InviteFriendsSection.tsx
import React, { useState } from "react";

interface Props {
  destinationId: string;
}

const InviteFriendsSection: React.FC<Props> = ({ destinationId }) => {
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState<string[]>([]);

  const handleInvite = () => {
    if (!email) return;
    setInvites((prev) => [...prev, email]);
    setEmail("");
    // TODO: call API to send invite using destinationId
    console.log(`Invited ${email} to destination ${destinationId}`);
  };

  return (
    <div className="invite-section border rounded-lg p-4 mt-6 shadow-sm bg-white">
      <h3 className="text-lg font-semibold mb-2">Invite Friends</h3>
      <div className="flex items-center space-x-2 mb-3">
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          onClick={handleInvite}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Invite
        </button>
      </div>
      {invites.length > 0 && (
        <ul className="text-gray-700 text-sm list-disc list-inside">
          {invites.map((e, idx) => (
            <li key={idx}>{e} (invited)</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InviteFriendsSection;

// Notes / Features
// Email input + Invite button
// Displays list of invited emails
// Currently logs invite action (placeholder for API call)
// Mobile-first, responsive styling
// Rounded card with shadow matches other sections