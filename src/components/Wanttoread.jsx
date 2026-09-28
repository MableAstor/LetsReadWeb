import moreIcon from "../assets/more-icon.png";
import binIcon from "../assets/bin.png";
import makeasreadIcon from "../assets/approve.png";
import wanttobuyIcon from "../assets/checklist.png";
import khemjira from "../assets/khemjira.gif";
import { useState } from "react";
export default function WanttoRead() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-50">
      <img
        src={khemjira}
        alt="Book Cover"
        className="w-full h-55 object-cover rounded-md mb-2"
      />
      <h3 className="text-lg font-bold">Khemjira</h3>
      <p className="text-gray-600 text-sm mb-2">Author : คาลิ</p>
      <div className="flex items-center gap-1">
        
        <div className="inline-flex items-center border border-black rounded-full px-3 py-1">
          
          <p className="text-sm">Yaoi</p>
        </div>
        <div className="inline-flex items-center border border-black rounded-full px-3 py-1">
          
          <p className="text-sm">Dark</p>
        </div>

        <div className="relative ml-auto">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            
            <img
              src={moreIcon}
              alt="More Options"
              className="h-6 w-6 object-contain"
            />
          </button>
          {/* Popup */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 z-20 w-48 rounded-xl bg-white shadow-lg border border-gray-200 py-2">
              
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                onClick={() => {
                  console.log("Move to Want to Buy");
                  setIsMenuOpen(false);
                }}
              >
                
                <div className="flex items-center">
                  <img
                  src={wanttobuyIcon}
                  alt="Want to Buy"
                  className="h-4 w-4 mr-2"
                />
                  <p className="inline">Want to Buy</p>
                </div>
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                onClick={() => {
                  console.log("Mark as Read");
                  setIsMenuOpen(false);
                }}
              >
                
                <div className="flex items-center">
                  <img
                  src={makeasreadIcon}
                  alt="Mark as Read"
                  className="h-4 w-4 mr-2 "
                />
                  <p className="inline">Mark as Read</p>
                </div>
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                onClick={() => {
                  console.log("Remove from Library");
                  setIsMenuOpen(false);
                }}
              >
                
                <div className="flex items-center">
                  <img
                    src={binIcon}
                    alt="Remove from Library"
                    className="h-4 w-4 mr-2"
                  />
                  <p className="inline">Remove from Library</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
