import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { joinByInvite } from "../api/groups";
import { useAuthStore } from "../store/authStore";

export default function Invite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const authToken = useAuthStore((s) => s.token);
  const [status, setStatus] = useState("loading"); // loading | success | error | already
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!authToken) {
      navigate(`/login?redirect=/invite/${token}`);
      return;
    }
    joinByInvite(token)
      .then(({ data }) => {
        setStatus("success");
        setMessage(data.name);
        setTimeout(() => navigate(`/groups/${data.id}`), 1500);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.detail || "");
      });
  }, []);

  const icon = { loading: "⏳", success: "🎉", error: "❌" }[status];
  const title = {
    loading: "초대 링크 처리 중...",
    success: `'${message}' 일기장에 참여했어요!`,
    error: "유효하지 않은 초대 링크입니다.",
  }[status];

  return (
    <div className="page-container flex flex-col items-center justify-center min-h-screen px-6 text-center bg-spring">
      <div className="bg-white rounded-3xl shadow-sm border border-pink-100 px-8 py-12 w-full">
        <div className="text-5xl mb-4">{icon}</div>
        <p className="text-lg font-semibold text-gray-900">{title}</p>
        {status === "success" && (
          <p className="mt-2 text-sm text-gray-400">잠시 후 일기장으로 이동합니다...</p>
        )}
        {status === "error" && (
          <button onClick={() => navigate("/groups")}
            className="mt-6 btn-primary max-w-xs mx-auto block">내 일기장 보기</button>
        )}
      </div>
    </div>
  );
}
