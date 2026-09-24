import profileIcon from "../assets/profile-icon.png";
import addPiture from "../assets/picture-solid.png";
import camerapc from "../assets/photo-camera.png";
import { useState } from "react";
export default function FeedPage() {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState(null);
  const [bookName, setBookName] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [reviewText, setReviewText] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();

    const reviewData = {
      bookName,
      mainCategory,
      subCategory,
      rating,
      reviewText,
      image,
    };

    console.log(reviewData);
  };

  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className=" overflow-y-auto w-full max-w-2xl mx-auto flex flex-row justify-content border border-gray-300 rounded-lg border-solid bg-white p-3 gap-2">
      <img src={profileIcon} alt="Profile Icon" className="h-8 w-8 mr-2" />
      <div onClick={() => setIsReviewOpen(true)} className="  border border-gray-800 rounded-lg pt-1 px-2 flex-grow  ">
        <input type="text" placeholder="Write a review..." readOnly className="  placeholder:text-left bg-transparent border-none focus:outline-none" />
      </div>
      <img src={addPiture} alt="Add Picture" className="h-8 w-8 " />

      {isReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="w-full max-w-4xl mx-auto rounded-2xl  bg-white p-6 shadow-xl">

            {/* Header */}
            <div className="flex items-center  gap-8 ">
              <h2 className="text-xl font-bold mb-6">
                Write a Review
              </h2>
            </div>
            <div className="flex flex-row justify-between gap-8 ">
              <div className="border border-gray-950 rounded-xl w-60 h-75 flex items-center justify-center flex-col gap-3 overflow-hidden">

                <label
                  htmlFor="review-image"
                  className="w-full h-full flex items-center justify-center flex-col gap-3 cursor-pointer"
                >

                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <img
                        src={camerapc}
                        alt="Camera"
                        className="h-15 w-15"
                      />

                      <p className="text-gray-500">
                        Add a photo
                      </p>
                    </>
                  )}

                </label>

                <input
                  id="review-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

              </div>
              <div className="p-0">
                <div className="flex flex-row gap-6">
                  <div>
                    <p className="text-xl text-gray-950 font-bold pb-1">
                      Book name :
                    </p>
                    <div className="border border-gray-950 rounded-xl w-70 h-10 ">
                      <input type="text" placeholder="Enter book name..." value={bookName} onChange={(e) => setBookName(e.target.value)} className="w-full h-full px-3 py-2 rounded-lg border-none outline-none" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl text-gray-950 font-bold pb-1">
                      Main category :
                    </p>
                    <div className="border border-gray-950 rounded-xl w-70 h-10 ">
                      <input type="text" placeholder="Enter main category..." value={mainCategory} onChange={(e) => setMainCategory(e.target.value)} className="w-full h-full px-3 py-2 rounded-lg border-none outline-none" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-6 mt-5">
                  <div>
                    <p className="text-xl text-gray-950 font-bold pb-1">
                      Sub category :
                    </p>
                    <div className="border border-gray-950 rounded-xl w-70 h-10 ">
                      <select value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className="w-full h-full px-3 py-2 rounded-lg border-none outline-none">
                        <option value="" >Select category...</option>
                        <option value="fiction">Fiction</option>
                        <option value="romance">Romance</option>
                        <option value="fantasy">Fantasy</option>
                        <option value="mystery">Mystery</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <p className="text-xl text-gray-950 font-bold leading-none pb-1">
                      Rating Star :
                    </p>
                    <div className="h-10 flex items-center" >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-0 text-5xl leading-none transition ${star <= rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <textarea
                    placeholder="Write your review..."
                    value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                    className="w-full h-32 resize-none rounded-lg border border-gray-950 p-3 outline-none"
                  />
                </div>
              </div>
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
                onClick={handleSubmit}
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