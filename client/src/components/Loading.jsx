import React from 'react';

const Loading = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <span className="loading loading-spinner loading-lg text-green-600"></span>
            <p className="mt-4 text-green-700 font-medium animate-pulse text-lg tracking-wider">Loading RecycMate...</p>
        </div>
    );
};

export default Loading;
