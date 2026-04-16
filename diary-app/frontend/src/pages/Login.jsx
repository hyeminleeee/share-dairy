import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/feed";

  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await login(form);
      setAuth(data.access_token, data.user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container flex flex-col min-h-screen bg-spring">
      {/* 상단 여백 + 로고 */}
      <div className="flex flex-col items-center pt-16 pb-8 px-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md"
          style={{ backgroundColor: "var(--color-btn)" }}
        >
          📖
        </div>
        <h1 className="text-2xl font-bold text-gray-900">다시 만나요</h1>
        <p className="text-sm text-gray-400 mt-1">로그인하고 일기를 이어가세요</p>
      </div>

      {/* 폼 카드 */}
      <div className="flex-1 flex flex-col px-6 pb-10">
        <div className="bg-white rounded-3xl shadow-sm border border-pink-100 px-6 py-8 w-full">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 이메일 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">이메일</label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                className="input-field"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* 비밀번호 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  className="input-field pr-12"
                  placeholder="비밀번호를 입력하세요"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {/* 에러 */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* 제출 */}
            <button
              type="submit"
              className="btn-primary flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <><Spinner /><span>로그인 중...</span></> : "로그인"}
            </button>
          </form>

          {/* 하단 링크 */}
          <div className="mt-6 flex flex-col items-center gap-2 text-sm">
            <Link
              to="/find-account"
              className="text-gray-400 hover:text-point transition-colors"
            >
              이메일 / 비밀번호 찾기
            </Link>
            <p className="text-gray-500">
              계정이 없으신가요?{" "}
              <Link
                to={redirectTo !== "/feed" ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}
                className="font-semibold text-point hover:text-accent"
              >
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
