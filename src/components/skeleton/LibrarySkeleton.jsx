export default function LibrarySkeleton({ count = 10 }) {
  return (
    <div role="status" aria-label="กำลังโหลดชั้นหนังสือ" className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="animate-pulse rounded-[22px] border border-[#F0E0D9] bg-white p-3 shadow-sm">
          <div className="aspect-[3/4] rounded-xl bg-[#F3E7E2]" />
          <div className="mt-3 h-3 w-4/5 rounded-full bg-[#F3E7E2]" />
          <div className="mt-2 h-2.5 w-2/3 rounded-full bg-[#F8EEEA]" />
          <div className="mt-4 h-8 rounded-full bg-[#F5E9E5]" />
        </div>
      ))}
      <span className="sr-only">กำลังโหลดหนังสือ...</span>
    </div>
  );
}
