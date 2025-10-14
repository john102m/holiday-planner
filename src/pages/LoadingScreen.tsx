// components/common/LoadingScreen.tsx
import React from "react";

const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <img
                src="/logoscreen.png"
                alt="App logo"
                className="w-1/2 max-w-2xl"
            />

        </div>
    );
};

export default LoadingScreen;
