import { useState, useEffect } from "react";

const PwaInstallModal = ({ show, onClose, onInstall }: { show: boolean; onClose: () => void; onInstall: () => void; }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
    //localStorage.removeItem("itinera-hide-install");
  useEffect(() => {
    const flag = localStorage.getItem("itinera-hide-install");
    if (flag === "true") onClose(); // auto-close if user opted out
  }, [onClose]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("itinera-hide-install", "true");
    }
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full text-center border border-gray-200">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">📲 Make Itinera Yours</h2>
        <p className="text-gray-700 mb-4">
          Add Itinera to your phone for faster access, offline support, and a smoother experience.
        </p>
        <ul className="text-left text-sm text-gray-600 mb-4 list-disc list-inside">
          <li>No app store needed</li>
          <li>Works offline</li>
          <li>Saves your trips and memories</li>
        </ul>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => {
            onInstall();
            handleClose();
          }}
        >
          Install Itinera
        </button>

        <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
          <input
            type="checkbox"
            id="dontShowAgain"
            className="mr-2"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          <label htmlFor="dontShowAgain">Don’t show again</label>
        </div>

        <button
          className="mt-3 text-sm text-gray-500 underline"
          onClick={handleClose}
        >
          Not now
        </button>
      </div>
    </div>
  );
};

export default PwaInstallModal;
