import { Link } from "react-router-dom";
import CherryBlossoms from "../components/common/CherryBlossoms";

export default function Landing() {
  return (
    <div className="page-container relative flex flex-col items-center justify-center min-h-screen px-6 bg-spring overflow-hidden">
      {/* 벚꽃 — 콘텐츠 뒤에 위치 (z-index: 0) */}
      <CherryBlossoms count={25} />

      {/* 콘텐츠 — 꽃잎 위에 위치 (z-index: 10) */}
      <div className="relative z-10 text-center mb-12">
        <div className="text-6xl mb-5">📖</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">우리의 일기장</h1>
        <p className="text-gray-500 text-base leading-relaxed">
          친구와 함께 쓰는 공유 일기장.<br />
          소중한 순간을 함께 기록하세요.
        </p>
      </div>

      <div className="relative z-10 w-full space-y-3">
        <Link to="/register" className="btn-primary block text-center">
          시작하기
        </Link>
        <Link to="/login" className="btn-secondary block text-center">
          로그인
        </Link>
      </div>
    </div>
  );
}
