import { useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppLayout({ children, title, rightAction, showBack = false }) {
  const navigate = useNavigate();

  return (
    <div className="page-container relative">
      {title && (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="p-1 -ml-1 text-gray-500 hover:text-gray-700 shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-lg font-bold text-gray-900 truncate">{title}</h1>
          </div>
          {rightAction && <div className="shrink-0 ml-2">{rightAction}</div>}
        </header>
      )}
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
