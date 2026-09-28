import closeIcon from "../assets/close.png";
import NaiinLogo from "../assets/Naiin-logo.png";

export default function BookStoreModel({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-4xl mx-auto rounded-2xl  bg-white p-6 shadow-xl">
        <div className="flex justify-between items-center  gap-8 mb-6 ">
          <p className="text-xl font-bold"> Book Store Available </p>
          <button onClick={onClose} className="cursor-pointer">
            <img
              src={closeIcon}
              alt="close model book store"
              className="w-5 h-5"
            />
          </button>
        </div>
        <div className="flex flex-row gap-3">
          <div className="flex flex-row items-center bg-white px-4 py-4 rounded-2xl shadow-sm hover:bg-gray-200">
            <img
              src={NaiinLogo}
              alt="Naiin-logo"
              className="w-15 h-15 rounded-2xl mr-3"
            />
            <div>
              <p className="text-2xl mr-3">Naiin</p>
              <div className="flex flex-row">
                <p className="text-2xl mr-3 font-semibold">Price</p>
                <p className="text-2xl mr-3 text-emerald-700 font-bold">
                  474.05
                </p>
                <p className="text-2xl font-semibold">Bath</p>
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center bg-white px-4 py-4 rounded-2xl shadow-sm hover:bg-gray-200">
            <img
              src={NaiinLogo}
              alt="Naiin-logo"
              className="w-15 h-15 rounded-2xl mr-3"
            />
            <p className="text-2xl">Naiin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
