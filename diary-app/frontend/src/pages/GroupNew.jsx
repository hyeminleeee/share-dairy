import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../api/groups";
import AppLayout from "../components/layout/AppLayout";

export default function GroupNew() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await createGroup({ name });
      navigate(`/groups/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "일기장 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="새 일기장" showBack>
      <div className="px-4 pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">일기장 이름</label>
            <input
              type="text"
              className="input-field"
              placeholder="예: 우리 셋의 일기장"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "생성 중..." : "일기장 만들기"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
