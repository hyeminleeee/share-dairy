import { useState } from "react";
import { Link } from "react-router-dom";
import { findAccount, resetPassword } from "../api/auth";

export default function FindAccount() {
  const [tab, setTab] = useState("find"); // "find" | "reset"
  const [findForm, setFindForm] = useState({ name: "", phone: "" });
  const [resetForm, setResetForm] = useState({ email: "", phone: "", new_password: "" });
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleFind = async (e) => {
    e.preventDefault();
    setError(""); setResult("");
    setLoading(true);
    try {
      const { data } = await findAccount(findForm);
      setResult(data.email);
    } catch {
      setError("일치하는 계정을 찾을 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(""); setResetDone(false);
    setLoading(true);
    try {
      await resetPassword(resetForm);
      setResetDone(true);
    } catch {
      setError("일치하는 계정을 찾을 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container flex flex-col min-h-screen bg-spring">
      {/* 상단 헤더 */}
      <div className="flex items-center px-6 pt-14 pb-6">
        <Link
          to="/login"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors mr-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">계정 찾기</h1>
          <p className="text-sm text-gray-400 mt-0.5">이름과 전화번호로 계정을 찾아보세요</p>
        </div>
      </div>

      {/* 폼 카드 */}
      <div className="flex-1 px-6 pb-10">
        <div className="bg-white rounded-3xl shadow-sm border border-pink-100 px-6 py-8">
          {/* 탭 */}
          <div className="flex border-b border-gray-100 mb-6">
            {["find", "reset"].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setResult(""); setResetDone(false); }}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                  tab === t ? "text-point border-b-2 border-pink-300" : "text-gray-400"
                }`}
              >
                {t === "find" ? "이메일 찾기" : "비밀번호 재설정"}
              </button>
            ))}
          </div>

          {tab === "find" ? (
            <form onSubmit={handleFind} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">이름</label>
                <input type="text" className="input-field" placeholder="홍길동"
                  value={findForm.name} onChange={(e) => setFindForm({ ...findForm, name: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">전화번호</label>
                <input type="tel" className="input-field" placeholder="010-0000-0000"
                  value={findForm.phone} onChange={(e) => setFindForm({ ...findForm, phone: e.target.value })} required />
              </div>
              {result && (
                <div className="px-4 py-3 bg-pink-50 border border-pink-100 rounded-xl text-sm font-medium text-point">
                  가입된 이메일: <span className="font-bold">{result}</span>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
              <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
                {loading ? "찾는 중..." : "이메일 찾기"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">이메일</label>
                <input type="email" className="input-field" placeholder="가입한 이메일"
                  value={resetForm.email} onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">전화번호</label>
                <input type="tel" className="input-field" placeholder="010-0000-0000"
                  value={resetForm.phone} onChange={(e) => setResetForm({ ...resetForm, phone: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">새 비밀번호</label>
                <input type="password" className="input-field" placeholder="새 비밀번호 (8자 이상)"
                  value={resetForm.new_password} onChange={(e) => setResetForm({ ...resetForm, new_password: e.target.value })} required />
              </div>
              {resetDone && (
                <div className="px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm font-medium">
                  비밀번호가 재설정되었습니다.
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
              <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
                {loading ? "처리 중..." : "비밀번호 재설정"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/login" className="font-semibold text-point hover:text-accent">
              로그인으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
