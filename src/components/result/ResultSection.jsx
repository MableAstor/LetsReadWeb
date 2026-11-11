
export default function ResultSection({ icon, title, description, children }) {
  return (
    <section className="min-w-0 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f3e9e2] text-lg">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-[#403b37] sm:text-base">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs leading-relaxed text-[#a29589] sm:text-sm">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}
