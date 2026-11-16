import React from "react";

function Bone({ className = "" }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-[#EEDDD5] ${className}`} />;
}

export default function PublicProfileSkeleton() {
  return (
    <main className="mx-auto w-full max-w-5xl px-3 pb-10 pt-4 sm:px-6 sm:pt-8" role="status" aria-label="กำลังโหลดโปรไฟล์นักอ่าน" aria-busy="true">
      <span className="sr-only">กำลังโหลดโปรไฟล์นักอ่าน...</span>
      <Bone className="mb-4 h-10 w-10 rounded-full" />
      <section className="overflow-hidden rounded-[28px] border border-[#F1DFD7] bg-[#FFFAF7] shadow-sm">
        <div className="h-24 bg-gradient-to-r from-[#E9B9AD] via-[#F4D4C9] to-[#F9E7DE] sm:h-32" />
        <div className="px-5 pb-7 sm:px-8 sm:pb-8">
          <div className="-mt-12 flex flex-col items-center gap-3 sm:-mt-14 sm:flex-row sm:items-end sm:gap-6">
            <Bone className="relative z-10 h-[110px] w-[110px] shrink-0 rounded-full border-[5px] border-[#FFFAF7]" />
            <div className="flex w-full min-w-0 flex-1 flex-col items-center gap-3 sm:items-start sm:pb-2">
              <Bone className="h-3 w-28" />
              <Bone className="h-7 w-48 max-w-full" />
              <Bone className="h-3 w-40 max-w-full" />
            </div>
            <div className="flex gap-2 sm:mb-2">
              <Bone className="h-16 w-20 rounded-xl" />
              <Bone className="h-16 w-20 rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <Bone className="mb-2 h-3 w-24" />
        <Bone className="mb-2 h-6 w-44" />
        <Bone className="mb-4 h-3 w-60 max-w-full" />
        <div className="rounded-[26px] border border-[#F0DDD3] bg-[#FFF8F3] p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-3 border-b border-[#EEDDD4] pb-4">
            <Bone className="h-10 w-10 rounded-xl" />
            <div className="space-y-2"><Bone className="h-4 w-36" /><Bone className="h-3 w-28" /></div>
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="flex w-[112px] flex-col items-center gap-3 sm:w-[130px]">
                <Bone className="h-[88px] w-[88px] rounded-full sm:h-[104px] sm:w-[104px]" />
                <Bone className="h-3 w-20" />
                <Bone className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="space-y-2"><Bone className="h-3 w-32" /><Bone className="h-6 w-52 max-w-full" /><Bone className="h-3 w-56 max-w-full" /></div>
          <Bone className="h-16 w-20 rounded-2xl" />
        </div>
        <div className="rounded-[26px] border border-[#F0DDD3] bg-[#FFF8F3] p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#EEDDD4] pb-4">
            <div className="space-y-2"><Bone className="h-4 w-32" /><Bone className="h-3 w-44" /></div>
            <Bone className="h-7 w-24 rounded-full" />
          </div>
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((n) => (
              <div key={n} className="rounded-2xl border border-[#F0E6E0] bg-white p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                  <Bone className="h-[118px] w-[82px] shrink-0 rounded-xl sm:h-[136px] sm:w-[94px]" />
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <Bone className="h-4 w-4/5" />
                    <div className="flex gap-2"><Bone className="h-5 w-16 rounded-full" /><Bone className="h-5 w-20 rounded-full" /></div>
                    <Bone className="h-3 w-28" /><Bone className="h-3 w-24" />
                  </div>
                </div>
                <div className="mt-4 space-y-2 border-t border-[#F3EAE5] pt-3"><Bone className="h-3 w-full" /><Bone className="h-3 w-3/4" /></div>
                <div className="mt-4 flex justify-between border-t border-[#F7EFEB] pt-3"><Bone className="h-3 w-16" /><Bone className="h-3 w-24" /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
