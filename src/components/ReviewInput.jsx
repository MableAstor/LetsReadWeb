import profileicon from "../assets/profile-icon.png";

export default function ReviewInput({ onClick }) {
    return (
        <div className=" overflow-y-auto w-full max-w-2xl mx-auto flex flex-row justify-content border border-gray-300 rounded-lg border-solid bg-white p-3 gap-2">
            <img src={profileicon} alt="Profile Icon" className="h-8 w-8 mr-2" />
            <div onClick={onClick} className="  border border-gray-800 rounded-lg pt-1 px-2 w-full cursor-pointer ">
                <input type="text" placeholder="Write a review..." readOnly className="  placeholder:text-left bg-transparent border-none focus:outline-none" />
            </div>
        </div>
    )
}