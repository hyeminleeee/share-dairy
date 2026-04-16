import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteGroup, getGroup, leaveGroup } from "../api/groups";
import { getGroupPosts } from "../api/posts";
import { toggleLike } from "../api/likes";
import { useAuthStore } from "../store/authStore";
import AppLayout from "../components/layout/AppLayout";

// ── 포스트 카드 ───────────────────────────────────────────
function PostCard({ post: initialPost }) {
  const [post, setPost] = useState(initialPost);

  const handleLike = async () => {
    try {
      const { data } = await toggleLike(post.id);
      setPost((p) => ({ ...p, is_liked: data.liked, like_count: data.like_count }));
    } catch {}
  };

  return (
    <div className="card mb-3">
      <div className="flex items-center gap-3 mb-3">
        {post.author.profile_image_url ? (
          <img
            src={post.author.profile_image_url}
            alt={post.author.name}
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary-200 flex items-center justify-center text-point font-bold text-sm shrink-0">
            {post.author.name[0]}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900">{post.author.name}</p>
          <p className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>

      {post.image_url && (
        <img src={post.image_url} alt="" className="w-full rounded-xl mb-3 object-cover max-h-72" />
      )}

      <Link to={`/posts/${post.id}`}>
        <p className="text-gray-800 text-sm leading-relaxed line-clamp-3">{post.content}</p>
      </Link>

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            post.is_liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
          }`}
        >
          <span>{post.is_liked ? "❤️" : "🤍"}</span>
          <span>{post.like_count ?? 0}</span>
        </button>
        <Link
          to={`/posts/${post.id}`}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-point"
        >
          <span>💬</span>
          <span>{post.comment_count ?? 0}</span>
        </Link>
      </div>
    </div>
  );
}

// ── 정보 바텀시트 ─────────────────────────────────────────
function InfoSheet({ group, currentUserId, onClose, onLeave, onDelete }) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = `${window.location.origin}/invite/${group.invite_token}`;
  const isOwner = currentUserId === group.owner_id;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      {/* 시트 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white rounded-t-3xl z-50 pb-10 shadow-xl">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-6 pt-2 space-y-5">
          <h2 className="text-base font-bold text-gray-900">{group.name}</h2>

          {/* 초대 링크 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">초대 링크</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteUrl}
                className="input-field text-xs flex-1 text-gray-500 bg-gray-50"
              />
              <button
                onClick={copyInvite}
                className="px-4 py-3 rounded-xl text-xs font-semibold text-white whitespace-nowrap transition-colors"
                style={{ backgroundColor: copied ? "#a3c4a3" : "var(--color-btn)" }}
              >
                {copied ? "복사됨!" : "복사"}
              </button>
            </div>
          </div>

          {/* 멤버 */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-3">
              멤버 ({group.members?.length})
            </p>
            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {group.members?.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  {m.user.profile_image_url ? (
                    <img
                      src={m.user.profile_image_url}
                      alt={m.user.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-point font-bold text-sm shrink-0">
                      {m.user.name[0]}
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-900">
                    {m.user.name}
                    {m.user.id === group.owner_id && (
                      <span className="ml-1.5 text-xs text-point font-semibold">방장</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 액션 */}
          <div className="pt-1">
            {isOwner ? (
              <button
                onClick={onDelete}
                className="w-full py-3 rounded-xl text-sm font-semibold border border-red-100 text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
              >
                일기장 삭제
              </button>
            ) : (
              <button
                onClick={onLeave}
                className="w-full py-3 rounded-xl text-sm font-semibold border border-red-100 text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
              >
                일기장 나가기
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────
export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);

  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    Promise.all([getGroup(id), getGroupPosts(id)])
      .then(([{ data: g }, { data: p }]) => {
        setGroup(g);
        setPosts(p);
      })
      .catch(() => navigate("/groups"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLeave = async () => {
    if (!confirm("정말 이 일기장에서 나가시겠습니까?")) return;
    try {
      await leaveGroup(id);
      navigate("/groups");
    } catch (err) {
      alert(err.response?.data?.detail || "오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("일기장을 삭제하면 모든 글이 함께 삭제됩니다. 계속할까요?")) return;
    try {
      await deleteGroup(id);
      navigate("/groups");
    } catch (err) {
      alert(err.response?.data?.detail || "오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <AppLayout title="일기장" showBack>
        <div className="flex justify-center py-16 text-gray-400">불러오는 중...</div>
      </AppLayout>
    );
  }

  return (
    <>
      <AppLayout
        title={group?.name ?? "일기장"}
        showBack
        rightAction={
          <div className="flex items-center gap-3">
            <Link
              to={`/posts/new?group=${id}`}
              className="text-point font-semibold text-sm"
            >
              글쓰기
            </Link>
            <button onClick={() => setShowInfo(true)} className="text-gray-500 hover:text-gray-700">
              {/* 사람 아이콘 */}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        }
      >
        <div className="px-4 pt-4">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <span className="text-4xl mb-3">📝</span>
              <p className="text-sm">아직 작성된 일기가 없어요</p>
              <Link
                to={`/posts/new?group=${id}`}
                className="mt-4 text-point text-sm font-semibold"
              >
                첫 일기 쓰기
              </Link>
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </AppLayout>

      {showInfo && group && (
        <InfoSheet
          group={group}
          currentUserId={currentUser?.id}
          onClose={() => setShowInfo(false)}
          onLeave={handleLeave}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
