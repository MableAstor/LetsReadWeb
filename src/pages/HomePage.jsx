import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookCard } from "../components/BookCard";
import { viralBooks, topBooks } from "../data/books";

export default function HomePage() {


  
function BookSection({ title, books, icon, viewAllLink }) {
  const [limit, setLimit] = useState(4);

  useEffect(() => {
    const updateLimit = () => {
      if (window.innerWidth >= 1536) {
        setLimit(7);
      } else if (window.innerWidth >= 768) {
        setLimit(6);
      } else {
        setLimit(4);
      }
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);

    return () => {
      window.removeEventListener("resize", updateLimit);
    };
  }, []);

  return (
    <section className="w-full min-w-0">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex min-w-0 items-center gap-2 text-lg font-bold text-[#533C3E]">
          {title}
          {icon && <span>{icon}</span>}
        </h2>

        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="shrink-0 text-sm font-medium text-[#C65B61] hover:underline"
          >
            ดูทั้งหมด →
          </Link>
        )}
      </div>

      <div className="grid w-full min-w-0 grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 2xl:grid-cols-7">
        {books.slice(0, limit).map((book) => (
          <div key={book.id} className="min-w-0">
            <BookCard book={book} />
          </div>
        ))}
      </div>
    </section>
  );
}

  return (
  <div className="mx-auto box-border w-full min-w-0 max-w-6xl px-3 py-6 pb-28 font-sans">
  <div className="w-full min-w-0 space-y-8">
    <BookSection
      title="หนังสือ Viral มาแรง"
      icon="🔥"
      books={viralBooks}
      viewAllLink="/viral-books"
    />
    <BookSection
      title="หนังสือ Top 100"
      icon="🏆"
      books={topBooks}
      viewAllLink="/top-100"
    />
  </div>
</div>
);
}
