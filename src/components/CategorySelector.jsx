import { useState } from 'react';

export default function CategorySelector({ maxSelect = 5 }) {
  const [selectedTags, setSelectedTags] = useState([]);

  const categories = [
    'Romance', 'Fantasy', 'Adventure', 'Mystery', 'Thriller',
    'Horror', 'Scifi', 'Historical', 'Yaoi', 'Yuri'
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((item) => item !== tag));
    } else {
      if (selectedTags.length < maxSelect) {
        setSelectedTags([...selectedTags, tag]);
      } else {
        alert(`เลือกได้สูงสุด ${maxSelect} หมวดหมู่เท่านั้นครับ`);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">
        Select a main category (1-{maxSelect} categories)
        <span className="ml-2 text-sm text-gray-500 font-normal">
          ({selectedTags.length}/{maxSelect})
        </span>
      </h2>

      <div className="flex flex-wrap gap-2">
        {categories.map((tag) => {
          const isActive = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-black border-gray-300 hover:border-gray-400'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}