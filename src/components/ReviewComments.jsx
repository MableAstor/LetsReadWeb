import { useCallback, useEffect, useState } from "react";
import { MessageCircle, Send, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "") + "/api/auth";

export default function ReviewComments({ reviewId }) {
  const [comments, setComments] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [sort, setSort] = useState("latest");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [myUserId, setMyUserId] = useState(null);

  const load = useCallback(async () => {
    if (!reviewId) return;
    setLoading(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API_URL}/reviews/${reviewId}/comments`, {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) throw new Error(result.message || "โหลดความคิดเห็นไม่สำเร็จ");
      setComments(result.comments || []);
      setMyUserId(result.currentUserId ?? null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [reviewId]);

  useEffect(() => { load(); }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || busy) return;
    setBusy(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) { setError("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น"); return; }
      const response = await fetch(`${API_URL}/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ content }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) throw new Error(result.message || "ส่งความคิดเห็นไม่สำเร็จ");
      setDraft("");
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const remove = async (commentId) => {
    if (busy || !window.confirm("ลบความคิดเห็นนี้ใช่ไหม?")) return;
    setBusy(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("กรุณาเข้าสู่ระบบ");
      const response = await fetch(`${API_URL}/reviews/${reviewId}/comments/${commentId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) throw new Error(result.message || "ลบความคิดเห็นไม่สำเร็จ");
      await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  const sorted = [...comments].sort((a, b) => {
    const delta = new Date(b.Created_At).getTime() - new Date(a.Created_At).getTime();
    return sort === "latest" ? delta : -delta;
  });
  // Preview always shows the latest comment, regardless of expanded-list sorting.
  const visible = expanded ? sorted : [...comments].sort((a, b) => new Date(b.Created_At) - new Date(a.Created_At)).slice(0, 1);

  return (
    <section className="border-t border-[#F1D9D2] px-4 py-3 sm:px-5" aria-label="ความคิดเห็น">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#684B50]">
          <MessageCircle className="h-4 w-4" /> ความคิดเห็น ({comments.length})
        </div>
        {expanded && comments.length > 1 && (
          <select aria-label="เรียงความคิดเห็น" value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-[#F1D9D2] bg-white px-2 py-1 text-xs text-[#684B50]">
            <option value="latest">ล่าสุดก่อน</option>
            <option value="oldest">เก่าสุดก่อน</option>
          </select>
        )}
      </div>
      {loading ? <p className="text-xs text-[#98777A]">กำลังโหลดความคิดเห็น...</p> : (
        <div className="space-y-3">
          {visible.map((comment) => (
            <div key={comment.CommentID} className="flex gap-2 rounded-xl bg-[#FFFAF8] p-2.5">
              {comment.User_Avatar_URL ? <img src={comment.User_Avatar_URL} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" /> : <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4DEDD] text-xs text-[#684B50]">{(comment.User_Name || "R").charAt(0)}</div>}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-xs font-semibold text-[#684B50]">{comment.User_Name || "Reader"}</span>
                  <time className="text-[11px] text-[#B18A8D]">{new Date(comment.Created_At).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}</time>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm text-[#80676A]">{comment.Content}</p>
              </div>
              {myUserId != null && String(myUserId) === String(comment.UserID) && (
                <button type="button" disabled={busy} onClick={() => remove(comment.CommentID)} aria-label="ลบความคิดเห็น" className="self-start p-1 text-[#B18A8D] hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
          ))}
          {comments.length === 0 && <p className="text-xs text-[#98777A]">ยังไม่มีความคิดเห็น มาเป็นคนแรกกันนะ</p>}
          {comments.length > 1 && <button type="button" onClick={() => setExpanded((value) => !value)} className="text-xs font-semibold text-[#B77D80] hover:underline">{expanded ? "ย่อความคิดเห็น" : `ดูความคิดเห็นทั้งหมด (${comments.length})`}</button>}
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-xs text-red-600">{error} <button type="button" onClick={load} className="underline">ลองใหม่</button></p>}
      <form onSubmit={submit} className="mt-3 flex items-end gap-2">
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={1000} rows={1} placeholder="เขียนความคิดเห็น..." aria-label="เขียนความคิดเห็น" className="min-h-10 max-h-28 min-w-0 flex-1 resize-y rounded-xl border border-[#F1D9D2] bg-white px-3 py-2 text-sm outline-none focus:border-[#D99BA0]" />
        <Button type="submit" size="sm" disabled={busy || !draft.trim()} className="h-10 rounded-xl bg-[#D99BA0] text-white hover:bg-[#C9868C]"><Send className="h-4 w-4" /> ส่ง</Button>
      </form>
    </section>
  );
}
