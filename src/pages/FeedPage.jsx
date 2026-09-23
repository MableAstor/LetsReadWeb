import profileIcon from "../assets/profile-icon.png";
import addPiture from "../assets/picture-solid.png";
import { useState } from "react";
export default function FeedPage() {
   const [isReviewOpen, setIsReviewOpen] = useState(false);
  return (
  <div className=" w-full max-w-2xl mx-auto flex flex-row justify-content border border-gray-300 rounded-lg border-solid bg-white p-3 gap-2">
    <img src={profileIcon} alt="Profile Icon" className="h-8 w-8 mr-2"/>
    <div onClick={() => setIsReviewOpen(true)} className="  border border-gray-800 rounded-lg pt-1 px-2 flex-grow  ">
      <input  type="text" placeholder="Write a review..." readOnly className="  placeholder:text-left bg-transparent border-none focus:outline-none" />
    </div>
    <img src={addPiture} alt="Add Picture" className="h-8 w-8 "/>

    {isReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="w-full max-w-2xl mx-auto rounded-2xl  bg-white p-6 shadow-xl">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">
                Write a Review
              </h2>

              <button
                onClick={() => setIsReviewOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="border border-b-gray-950 rounded-xl w-50 h-70"></div>


            {/* Rating */}
            <div className="mb-4">
              <p className="mb-2 font-medium">Rating</p>

              <div className="flex gap-1">
                ⭐ ⭐ ⭐ ⭐ ⭐
              </div>
            </div>


            {/* Review */}
            <textarea
              placeholder="Write your review..."
              className="w-full h-32 resize-none rounded-lg border border-gray-300 p-3 outline-none focus:border-gray-500"
            />


            {/* Add Picture */}
            <div className="mt-4">
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2">
                <img
                  src={addPiture}
                  alt="Add Picture"
                  className="h-5 w-5"
                />
                Add Picture
              </button>
            </div>


            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsReviewOpen(false)}
                className="rounded-lg border border-gray-300 px-5 py-2"
              >
                Cancel
              </button>

              <button
                className="rounded-lg bg-black text-white px-5 py-2"
              >
                Post Review
              </button>
            </div>

          </div>

        </div>
      )}
  </div>
  
);
}