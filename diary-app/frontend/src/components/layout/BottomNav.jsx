import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/feed", icon: "🏠", label: "홈" },
  { to: "/groups", icon: "📚", label: "일기장" },
  { to: "/posts/new", icon: "✏️", label: "쓰기" },
  { to: "/mypage", icon: "👤", label: "내 정보" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-100 flex items-center justify-around h-16 z-50">
      {NAV_ITEMS.map(({ to, icon, label }) => {
        const active = pathname === to || (to !== "/feed" && pathname.startsWith(to));
        return (
          <Link key={to} to={to}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              active ? "text-point" : "text-gray-400"
            }`}>
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
