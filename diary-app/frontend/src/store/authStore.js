import { create } from "zustand";

// 페이지 로드 시 localStorage에서 동기적으로 읽어 초기값으로 사용
// → Zustand persist 미들웨어의 async 수화 지연 없이 첫 렌더부터 올바른 상태 유지
function loadStored() {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Zustand persist 미들웨어가 저장한 형식({ state: {...} })도 호환 처리
    return parsed.state ?? parsed;
  } catch {}
  return {};
}

const stored = loadStored();

export const useAuthStore = create((set, get) => ({
  token: stored.token ?? null,
  user:  stored.user  ?? null,

  setAuth: (token, user) => {
    localStorage.setItem("access_token",  token);
    localStorage.setItem("auth-storage",  JSON.stringify({ token, user }));
    set({ token, user });
  },

  clearAuth: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth-storage");
    set({ token: null, user: null });
  },

  setUser: (user) => {
    const { token } = get();
    localStorage.setItem("auth-storage", JSON.stringify({ token, user }));
    set({ user });
  },
}));
