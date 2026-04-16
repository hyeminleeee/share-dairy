import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Feed from "./pages/Feed";
import FindAccount from "./pages/FindAccount";
import GroupDetail from "./pages/GroupDetail";
import GroupNew from "./pages/GroupNew";
import Groups from "./pages/Groups";
import Invite from "./pages/Invite";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import MyPage from "./pages/MyPage";
import PostDetail from "./pages/PostDetail";
import PostEdit from "./pages/PostEdit";
import PostNew from "./pages/PostNew";
import Register from "./pages/Register";

/** 로그인 필요 — 미인증 시 현재 경로를 redirect 파라미터로 넘겨 /login으로 이동 */
function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }
  return children;
}

/** 로그인 불필요 — 인증된 사용자는 /feed로 */
function PublicRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  return token ? <Navigate to="/feed" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 공개 */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/find-account" element={<PublicRoute><FindAccount /></PublicRoute>} />

        {/* 초대 링크 — 비로그인 시 로그인 후 복귀 */}
        <Route path="/invite/:token" element={<Invite />} />

        {/* 인증 필요 */}
        <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
        <Route path="/groups" element={<PrivateRoute><Groups /></PrivateRoute>} />
        <Route path="/groups/new" element={<PrivateRoute><GroupNew /></PrivateRoute>} />
        <Route path="/groups/:id" element={<PrivateRoute><GroupDetail /></PrivateRoute>} />
        <Route path="/posts/new" element={<PrivateRoute><PostNew /></PrivateRoute>} />
        <Route path="/posts/:id" element={<PrivateRoute><PostDetail /></PrivateRoute>} />
        <Route path="/posts/:id/edit" element={<PrivateRoute><PostEdit /></PrivateRoute>} />
        <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />

        {/* 없는 경로 → 랜딩 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
