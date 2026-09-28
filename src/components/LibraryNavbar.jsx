import { useState } from "react";

export default function LibraryNavbar({ activeTab, onTabChange }) {
  const tabs = [
    { id: "wantToRead", label: "Want to Read" },
    { id: "wantToBuy", label: "Want to Buy" },
    { id: "savedBooks", label: "Saved Books" },
  ];

  return (
    <div className="w-full border-b rounded-2xl text-2xl items-center border-gray-200 bg-white">
      <div className="flex items-center justify-center gap-10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-2 py-4 text-sm transition-all ${
                isActive
                  ? "font-semibold text-black"
                  : "font-normal text-gray-500 hover:text-black"
              }`}
            >
              {tab.label}

              {isActive && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-black" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}