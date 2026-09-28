import { useState } from "react";
import LibraryNavbar from "../components/LibraryNavbar";
import WanttoReads from "../components/WanttoRead";
export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("wantToRead");

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6">Library</h1>
      {/* Library Tabs */}
      <LibraryNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="py-6">

        {activeTab === "wantToRead" && (
          <div className="grid grid-cols-5 gap-x-3 gap-y-4 justify-items-center text-lg font-semibold mb-4">
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
            <h2 className="text-lg font-semibold mb-4">
              Want to Buy
            </h2>

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