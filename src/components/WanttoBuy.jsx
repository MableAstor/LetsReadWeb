import React from "react";
import khemjira from "../assets/khemjira.gif";
export default function WanttoBuy({onClick}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-60">
      <img
        src={khemjira}
        alt="Book Cover"
        className="w-full h-65 object-cover rounded-md mb-2"
      />
      <h3 className="text-lg font-bold">Khemjira</h3>
      <p className="font-semibold mb-1 text-center">Available at </p>
      <button className="bg-blue-500 text-white px-2 py-2 rounded-full hover:bg-blue-600 w-full mb-2 cursor-pointer">
        Official Store
      </button>
      <button onClick={onClick} className="bg-gray-300 text-gray-700 px-2 py-2 rounded-full hover:bg-gray-400 w-full cursor-pointer">
        Book Store
      </button>
    </div>
  );
}
