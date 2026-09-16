import { useState } from 'react';

export default function CategoryCard({ onSearch, maxSelect = 5 }) {
  
  const [mainCategories, setMainCategories] = useState(['Fantasy', 'Yaoi']);
  const [subCategories, setSubCategories] = useState(['Historical', 'Dark/Tragedy']);

 
  const mainList = [
    'Romance', 'Fantasy', 'Adventure', 'Mystery', 'Thiller',
    'Horror', 'Scifi', 'Historical', 'Yaoi', 'Yuri'
  ];

  const subList = [
    'Historical', 'School/Campus', 'Dark/Tragedy', 'Action/Adventure', 'Sci-Fi/Funturistic'
  ];

  
  const toggleCategory = (tag, selectedList, setSelectedList) => {
    if (selectedList.includes(tag)) {
      setSelectedList(selectedList.filter((item) => item !== tag));
    } else {
      if (selectedList.length < maxSelect) {
        setSelectedList([...selectedList, tag]);
      } else {
        alert(`เลือกได้สูงสุด ${maxSelect} หมวดหมู่เท่านั้นค่ะ`);
      }
    }
  };

  const handleFindBook = () => {
    if (onSearch) {
      onSearch({ main: mainCategories, sub: subCategories });
    } else {
      console.log('Main:', mainCategories, 'Sub:', subCategories);
    }
  };

  return (

    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl p-7 shadow-sm">
      

      <div className="space-y-2.5 mb-5">
        <h2 className="text-xs font-bold text-black">
          เลือกหมวดหลัก ( 1 - 5 หมวด )
        </h2>
        <div className="flex flex-wrap gap-2">
          {mainList.map((tag) => {
            const isActive = mainCategories.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleCategory(tag, mainCategories, setMainCategories)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? 'bg-[#1D77FF] text-white border-[#1D77FF]'
                    : 'bg-white text-black border-gray-300 hover:border-gray-500'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>


      <div className="space-y-2.5 mb-6">
        <h2 className="text-xs font-bold text-black">
          เลือกหมวดหลัก ( 1 - 5 หมวด )
        </h2>
        <div className="flex flex-wrap gap-2">
          {subList.map((tag) => {
            const isActive = subCategories.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleCategory(tag, subCategories, setSubCategories)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? 'bg-[#1D77FF] text-white border-[#1D77FF]'
                    : 'bg-white text-black border-gray-300 hover:border-gray-500'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

    
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleFindBook}
          className="bg-[#1D77FF] hover:bg-blue-600 text-white font-semibold text-sm px-6 py-2 rounded-full transition-colors"
        >
          Find a Book
        </button>
      </div>

    </div>
  );
}