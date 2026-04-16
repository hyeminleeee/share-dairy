import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { register } from "../api/auth";
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

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function formatPhone(value) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/feed";
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const pwValid = form.password.length >= 8;
  const confirmMatch = form.confirm.length > 0 && form.password === form.confirm;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "phone" ? formatPhone(value) : value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pwValid) { setError("비밀번호는 8자 이상이어야 합니다."); return; }
    if (!confirmMatch) { setError("비밀번호가 일치하지 않습니다."); return; }
    setError("");
    setLoading(true);
    try {
      const { data } = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      setAuth(data.access_token, data.user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail === "Email already registered") setError("이미 사용 중인 이메일입니다.");
      else if (detail === "Phone number already registered") setError("이미 사용 중인 전화번호입니다.");
      else setError(detail || "회원가입에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container flex flex-col min-h-screen bg-spring">
      {/* 상단 헤더 */}
      <div className="flex items-center px-6 pt-14 pb-6">
        <Link
          to="/"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors mr-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">회원가입</h1>
          <p className="text-sm text-gray-400 mt-0.5">새 계정을 만들어 시작하세요</p>
        </div>
      </div>

      {/* 폼 카드 */}
      <div className="flex-1 px-6 pb-10">
        <div className="bg-white rounded-3xl shadow-sm border border-pink-100 px-6 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* 이름 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">이름</label>
              <input
                type="text" name="name" autoComplete="name"
                className="input-field" placeholder="홍길동"
                value={form.name} onChange={handleChange} required
              />
            </div>

            {/* 이메일 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">이메일</label>
              <input
                type="email" name="email" autoComplete="email"
                className="input-field" placeholder="example@email.com"
                value={form.email} onChange={handleChange} required
              />
            </div>

            {/* 전화번호 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">전화번호</label>
              <input
                type="tel" name="phone" autoComplete="tel"
                className="input-field" placeholder="010-0000-0000"
                value={form.phone} onChange={handleChange} required
              />
            </div>

            {/* 비밀번호 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} name="password" autoComplete="new-password"
                  className={`input-field pr-12 ${
                    form.password.length > 0
                      ? pwValid ? "border-green-400" : "border-red-300"
                      : ""
                  }`}
                  placeholder="8자 이상 입력하세요"
                  value={form.password} onChange={handleChange} required
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <EyeIcon open={showPw} />
                </button>
              </div>
              {form.password.length > 0 && (
                <p className={`flex items-center gap-1 text-xs ${pwValid ? "text-green-600" : "text-red-400"}`}>
                  {pwValid && <CheckIcon />}
                  {pwValid ? "사용 가능한 비밀번호입니다" : `${8 - form.password.length}자 더 입력해주세요`}
                </p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"} name="confirm" autoComplete="new-password"
                  className={`input-field pr-12 ${
                    form.confirm.length > 0
                      ? confirmMatch ? "border-green-400" : "border-red-300"
                      : ""
                  }`}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={form.confirm} onChange={handleChange} required
                />
                <button type="button" tabIndex={-1} onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {form.confirm.length > 0 && (
                <p className={`flex items-center gap-1 text-xs ${confirmMatch ? "text-green-600" : "text-red-400"}`}>
                  {confirmMatch && <CheckIcon />}
                  {confirmMatch ? "비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다"}
                </p>
              )}
            </div>

            {/* 서버 에러 */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* 제출 */}
            <button type="submit" className="btn-primary flex items-center justify-center gap-2" disabled={loading}>
              {loading ? <><Spinner /><span>가입 중...</span></> : "회원가입"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="font-semibold text-point hover:text-accent">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
