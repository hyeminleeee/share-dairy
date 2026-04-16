import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listGroups } from "../api/groups";
import AppLayout from "../components/layout/AppLayout";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listGroups()
      .then(({ data }) => setGroups(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="일기장" rightAction={
      <Link to="/groups/new" className="text-point font-semibold text-sm">+ 새 일기장</Link>
    }>
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-10 text-gray-400">불러오는 중...</div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <span className="text-4xl mb-3">📚</span>
            <p className="text-sm">일기장이 없어요</p>
            <Link to="/groups/new" className="mt-4 text-point text-sm font-semibold">첫 일기장 만들기</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => (
              <Link key={g.id} to={`/groups/${g.id}`} className="card flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{g.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">멤버 {g.member_count}명</p>
                </div>
                <span className="text-gray-300 text-xl">›</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
