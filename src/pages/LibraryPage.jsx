import { useState } from "react";
import LibraryNavbar from "../components/LibraryNavbar";
import WanttoReads from "../components/WanttoRead";
import WanttoBuy from "../components/WanttoBuy";
import BookStoreModel from "../components/BookStoreModel";
export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("wantToBuy");
  const [isBookStoreOpen, setIsBookStoreOpen] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Library</h1>
      {/* Library Tabs */}
      <LibraryNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="py-6">

        {activeTab === "wantToRead" && (
          <div className="grid grid-cols-5 gap-x-10 gap-y-4 justify-items-center text-lg font-semibold mb-4">
              <WanttoReads />
              <WanttoReads />
              <WanttoReads />
              <WanttoReads />
              <WanttoReads />
              <WanttoReads />
              <WanttoReads />
          </div>
        )}

        {activeTab === "wantToBuy" && (
          <div>
              <WanttoBuy onClick={() => setIsBookStoreOpen(true)} />
                {isBookStoreOpen && (
                  <BookStoreModel onClose={() => setIsBookStoreOpen(false)}/>
                )}
          </div>
        )}

        {activeTab === "savedBooks" && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Saved Books
            </h2>

          </div>
        )}

      </div>
    </div>
    
  );
}