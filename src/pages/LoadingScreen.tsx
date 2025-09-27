// components/common/LoadingScreen.tsx
import React from "react";

const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <img
                src="/logoscreen.png"
                alt="App logo"
                className="w-4/5 max-w-3xl animate-pulse"
            />

        </div>
    );
};

export default LoadingScreen;
