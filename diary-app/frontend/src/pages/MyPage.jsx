import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile, changePassword, updateAvatar } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import AppLayout from "../components/layout/AppLayout";

function formatPhone(value) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm">
      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  );
}

// ── 프로필 수정 섹션 ──────────────────────────────────────
function ProfileSection({ user, onSaved, onCancel }) {
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await updateProfile({ name, phone });
      onSaved(data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail === "Phone number already registered") setError("이미 사용 중인 전화번호입니다.");
      else setError(detail || "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">이름</label>
        <input
          type="text"
          className="input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">전화번호</label>
        <input
          type="tel"
          className="input-field"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          placeholder="010-0000-0000"
          required
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">이메일</label>
        <input
          type="email"
          className="input-field bg-gray-50 text-gray-400 cursor-not-allowed"
          value={user?.email ?? ""}
          readOnly
        />
        <p className="text-xs text-gray-400">이메일은 변경할 수 없습니다.</p>
      </div>
      {error && <ErrorBox message={error} />}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-btn)" }}>
          {loading ? "저장 중..." : "저장"}
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50">
          취소
        </button>
      </div>
    </form>
  );
}

// ── 비밀번호 변경 섹션 ────────────────────────────────────
function PasswordSection({ onSaved, onCancel }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nextValid = form.next.length >= 8;
  const confirmMatch = form.confirm.length > 0 && form.next === form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nextValid) { setError("새 비밀번호는 8자 이상이어야 합니다."); return; }
    if (!confirmMatch) { setError("새 비밀번호가 일치하지 않습니다."); return; }
    setError("");
    setLoading(true);
    try {
      await changePassword({ current_password: form.current, new_password: form.next });
      onSaved();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail === "Current password is incorrect") setError("현재 비밀번호가 올바르지 않습니다.");
      else setError(detail || "변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const EyeBtn = ({ show, onToggle }) => (
    <button type="button" tabIndex={-1} onClick={onToggle}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
      {show ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      )}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
      {/* 현재 비밀번호 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">현재 비밀번호</label>
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            className="input-field pr-12"
            placeholder="현재 비밀번호 입력"
            value={form.current}
            onChange={(e) => { setForm(f => ({ ...f, current: e.target.value })); setError(""); }}
            required
          />
          <EyeBtn show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
        </div>
      </div>
      {/* 새 비밀번호 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">새 비밀번호</label>
        <div className="relative">
          <input
            type={showNext ? "text" : "password"}
            className={`input-field pr-12 ${form.next.length > 0 ? (nextValid ? "border-green-400" : "border-red-300") : ""}`}
            placeholder="8자 이상 입력"
            value={form.next}
            onChange={(e) => { setForm(f => ({ ...f, next: e.target.value })); setError(""); }}
            required
          />
          <EyeBtn show={showNext} onToggle={() => setShowNext(v => !v)} />
        </div>
        {form.next.length > 0 && (
          <p className={`flex items-center gap-1 text-xs ${nextValid ? "text-green-600" : "text-red-400"}`}>
            {nextValid && <CheckIcon />}
            {nextValid ? "사용 가능한 비밀번호입니다" : `${8 - form.next.length}자 더 입력해주세요`}
          </p>
        )}
      </div>
      {/* 새 비밀번호 확인 */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">새 비밀번호 확인</label>
        <input
          type="password"
          className={`input-field ${form.confirm.length > 0 ? (confirmMatch ? "border-green-400" : "border-red-300") : ""}`}
          placeholder="새 비밀번호 재입력"
          value={form.confirm}
          onChange={(e) => { setForm(f => ({ ...f, confirm: e.target.value })); setError(""); }}
          required
        />
        {form.confirm.length > 0 && (
          <p className={`flex items-center gap-1 text-xs ${confirmMatch ? "text-green-600" : "text-red-400"}`}>
            {confirmMatch && <CheckIcon />}
            {confirmMatch ? "비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다"}
          </p>
        )}
      </div>
      {error && <ErrorBox message={error} />}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading}
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-btn)" }}>
          {loading ? "변경 중..." : "변경"}
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50">
          취소
        </button>
      </div>
    </form>
  );
}

// ── 아바타 업로드 버튼 ────────────────────────────────────
function AvatarUploader({ user, onUploaded }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const { data } = await updateAvatar(fd);
      onUploaded(data);
    } catch (err) {
      setError(err.response?.data?.detail || "업로드에 실패했습니다.");
      setPreview(null);
    } finally {
      setUploading(false);
      // input 초기화 (같은 파일 재선택 가능하게)
      e.target.value = "";
    }
  };

  const imgSrc = preview || user?.profile_image_url || null;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => fileRef.current.click()}
        className="relative w-20 h-20 rounded-full shrink-0 focus:outline-none group"
        disabled={uploading}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt="프로필"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-primary-200 flex items-center justify-center text-3xl font-bold text-point">
            {user?.name?.[0] ?? "?"}
          </div>
        )}
        {/* 오버레이 */}
        <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <svg className="animate-spin w-6 h-6 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </div>
        {/* 카메라 배지 */}
        <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white border-2 border-pink-200 flex items-center justify-center shadow-sm">
          <svg className="w-3 h-3 text-point" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
      </button>
      <p className="text-xs text-gray-400">사진을 클릭해 변경</p>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────
export default function MyPage() {
  const navigate = useNavigate();
  const { user, setUser, clearAuth } = useAuthStore();
  const [activeSection, setActiveSection] = useState(null); // null | "profile" | "password"
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const handleProfileSaved = (updatedUser) => {
    setUser(updatedUser);
    setActiveSection(null);
  };

  const handlePasswordSaved = () => {
    setPwSuccess(true);
    setActiveSection(null);
    setTimeout(() => setPwSuccess(false), 3000);
  };

  const openSection = (section) => {
    setPwSuccess(false);
    setActiveSection(prev => prev === section ? null : section);
  };

  return (
    <AppLayout title="내 정보">
      <div className="px-4 pt-6 space-y-4">

        {/* 프로필 카드 */}
        <div className="card flex items-center gap-5">
          <AvatarUploader user={user} onUploaded={setUser} />
          <div>
            <p className="font-bold text-gray-900 text-lg">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-sm text-gray-400">{user?.phone}</p>
          </div>
        </div>

        {/* 메뉴 카드 */}
        <div className="card divide-y divide-gray-50">

          {/* 프로필 수정 */}
          <div>
            <button
              onClick={() => openSection("profile")}
              className="w-full text-left py-3 text-sm text-gray-700 flex items-center justify-between"
            >
              <span className="font-medium">프로필 수정</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${activeSection === "profile" ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeSection === "profile" && (
              <div className="pb-4">
                <ProfileSection
                  user={user}
                  onSaved={handleProfileSaved}
                  onCancel={() => setActiveSection(null)}
                />
              </div>
            )}
          </div>

          {/* 비밀번호 변경 */}
          <div>
            <button
              onClick={() => openSection("password")}
              className="w-full text-left py-3 text-sm text-gray-700 flex items-center justify-between"
            >
              <span className="font-medium">비밀번호 변경</span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${activeSection === "password" ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {activeSection === "password" && (
              <div className="pb-4">
                <PasswordSection
                  onSaved={handlePasswordSaved}
                  onCancel={() => setActiveSection(null)}
                />
              </div>
            )}
          </div>
        </div>

        {/* 비밀번호 변경 성공 메시지 */}
        {pwSuccess && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            비밀번호가 변경되었습니다.
          </div>
        )}

        {/* 로그아웃 */}
        <button onClick={handleLogout} className="btn-secondary text-red-500">
          로그아웃
        </button>

      </div>
    </AppLayout>
  );
}
