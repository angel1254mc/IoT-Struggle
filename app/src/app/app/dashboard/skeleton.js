import React from "react";

const Skeleton = () => {
    return (
        <div className="flex animate-pulse flex-col gap-y-2 mt-4 py-2 pb-3 px-2 mx-2 border-gray-300 border-[1px] rounded-md shadow-md bg-white">
            <p className="text-lg text-lightgreen">
                <div className="font-semibold w-44 bg-gray-100 h-4 rounded-full"></div>
            </p>
            <div className="w-full flex items-end justify-between">
                <div className="h-8 mt-2 mb-1 w-20 rounded-full bg-gray-100 font-bold text-lightgreen"></div>
                <p className="h-3 w-44 bg-gray-100 rounded-full">
                </p>
            </div>
            <div className="w-full h-2 rounded-xl overflow-hidden">
                <div className="h-2 w-full bg-gray-100"></div>
            </div>
        </div>
    );
};

export default Skeleton;
