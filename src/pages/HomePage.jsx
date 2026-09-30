import React from 'react';

export default function HomePage() {
  // ข้อมูลหมวด หนังสือ Viral มาแรง
  const viralBooks = [
    { id: 1, title: 'Harry Potter Part 1', author: 'J.K. Rowling', tag: 'Fantasy • Adventure', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400' },
    { id: 2, title: 'Harry Potter Part 2', author: 'J.K. Rowling', tag: 'Fantasy • Adventure', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400' },
    { id: 3, title: 'Harry Potter Part 3', author: 'J.K. Rowling', tag: 'Fantasy • Adventure', image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400' },
    { id: 4, title: 'Harry Potter Part 4', author: 'J.K. Rowling', tag: 'Fantasy • Adventure', image: 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?q=80&w=400' },
    { id: 5, title: 'Harry Potter Part 5', author: 'J.K. Rowling', tag: 'Fantasy • Adventure', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400' },
    { id: 6, title: 'Harry Potter Part 6', author: 'J.K. Rowling', tag: 'Fantasy • Adventure', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400' },
    { id: 7, title: 'Harry Potter Part 7', author: 'J.K. Rowling', tag: 'Fantasy • Adventure', image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=400' },
  ];

  // ข้อมูลหมวด หนังสือ Top 100
  const topBooks = [
    { id: 101, title: 'And Then There Were None', author: 'Agatha Christie', tag: 'Mystery • Murder', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400' },
    { id: 102, title: 'The Silent Patient', author: 'Alex Michaelides', tag: 'Mystery • Psychological', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400' },
    { id: 103, title: 'ปรมาจารย์ลัทธิมาร', author: 'Mo Xiang Tong Xiu', tag: "Boy's Love • Xianxia Fantasy", image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400' },
    { id: 104, title: 'Heartstopper', author: 'Alice Oseman', tag: "Boy's Love • Rom-Com", image: 'https://images.unsplash.com/photo-1532012164546-f432f2e37b73?q=80&w=400' },
    { id: 105, title: 'A Game of Thrones', author: 'George R.R. Martin', tag: 'Fantasy • Dark', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400' },
    { id: 106, title: 'The Name of the Wind', author: 'Patrick Rothfuss', tag: 'Fantasy • Magical', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400' },
    { id: 107, title: 'The Hobbit', author: 'J.R.R. Tolkien', tag: 'Adventure • Epic Fantasy', image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=400' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 font-sans space-y-8">
      
      {/* 1. ส่วนหนังสือ Viral มาแรง 🔥 */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
          <span>หนังสือ Viral มาแรง</span>
          <span>🔥</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {viralBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl p-2 shadow-xs hover:shadow-md transition duration-200 flex flex-col cursor-pointer"
            >
              <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100 mb-2">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>
              <h3 className="text-[11px] font-bold text-gray-900 truncate">
                {book.title}
              </h3>
              <p className="text-[9px] text-gray-500 truncate mt-0.5">
                {book.author}
              </p>
              <div className="mt-1">
                <span className="inline-block bg-[#fff2d6] text-[#b86d00] text-[8px] font-semibold px-1.5 py-0.5 rounded truncate max-w-full">
                  {book.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. ส่วนหนังสือ Top 100 */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          หนังสือ Top 100
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {topBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl p-2 shadow-xs hover:shadow-md transition duration-200 flex flex-col cursor-pointer"
            >
              <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100 mb-2">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-300"
                />
              </div>
              <h3 className="text-[11px] font-bold text-gray-900 truncate">
                {book.title}
              </h3>
              <p className="text-[9px] text-gray-500 truncate mt-0.5">
                {book.author}
              </p>
              <div className="mt-1">
                <span className="inline-block bg-[#fff2d6] text-[#b86d00] text-[8px] font-semibold px-1.5 py-0.5 rounded truncate max-w-full">
                  {book.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}