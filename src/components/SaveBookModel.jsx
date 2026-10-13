import closeIcon from "../assets/close.png";
import profileicon from "../assets/profile-icon.png";
import ReviewCard from "./ReviewCard";
export default function SaveBookModel({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-4xl mx-auto rounded-2xl  bg-white p-6 shadow-xl">
        <div className="flex justify-between items-center  gap-8 mb-6 ">
          <p className="text-xl font-bold"> Book Review Save </p>
          <button onClick={onClose} className="cursor-pointer">
            <img
              src={closeIcon}
              alt="close model book store"
              className="w-5 h-5"
            />
          </button>
        </div>
         <div className="overflow-y-auto w-full max-w-2xl mx-auto border border-gray-300 rounded-lg border-solid bg-white p-3 gap-2">
                    <div className="flex flex-row items-center mb-3">
                        <img src={profileicon} alt="Profile Icon" className="h-8 w-8 mr-2" />
                        <p className="font-bold">John Doe</p>
                    </div>
                    <div className="flex flex-col border border-gray-300 rounded-lg pt-3 px-2 w-full h-28">
                        <div className="flex flex-row gap-1 items-center">
                            <p className="font-bold">Book Title</p>
                            <div className="text-xl text-yellow-400">
                                ★★★★★
                            </div>
                            <div className="inline-flex items-center border border-black rounded-full px-3 py-1">
                                <p className="text-sm">Fantasy</p>
                            </div>
                            <div className=" inline-flex items-center border border-black rounded-full px-3 py-1">
                                <p className="text-sm">Adventure</p>
                            </div>
                        </div>
                        <p className="text-sm mt-2">This book was an amazing read! The characters were well-developed and the plot kept me hooked from start to finish. Highly recommend to anyone who loves fantasy and adventure!</p>
                    </div>
                </div>
      </div>
    </div>
  );
}
