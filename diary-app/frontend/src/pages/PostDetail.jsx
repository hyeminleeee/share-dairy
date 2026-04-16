import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deletePost, getPost } from "../api/posts";
import { createComment, deleteComment, listComments } from "../api/comments";
import { toggleLike } from "../api/likes";
import { useAuthStore } from "../store/authStore";
import AppLayout from "../components/layout/AppLayout";

function CommentItem({ comment, currentUserId, onDelete }) {
  return (
    <div className="py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary-200 flex items-center justify-center text-xs font-bold text-point">
            {comment.author.name[0]}
          </div>
          <span className="text-sm font-semibold text-gray-900">{comment.author.name}</span>
        </div>
        {comment.user_id === currentUserId && (
          <button onClick={() => onDelete(comment.id)} className="text-xs text-gray-400 hover:text-red-400">삭제</button>
        )}
      </div>
      <p className="text-sm text-gray-700 mt-1 ml-9">{comment.content}</p>
      {comment.replies?.map((r) => (
        <div key={r.id} className="ml-9 mt-2 pl-3 border-l-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                {r.author.name[0]}
              </div>
              <span className="text-sm font-semibold text-gray-800">{r.author.name}</span>
            </div>
            {r.user_id === currentUserId && (
              <button onClick={() => onDelete(r.id)} className="text-xs text-gray-400 hover:text-red-400">삭제</button>
            )}
          </div>
          <p className="text-sm text-gray-700 mt-0.5 ml-8">{r.content}</p>
        </div>
      ))}
    </div>
  );
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPost(id), listComments(id)])
      .then(([{ data: p }, { data: c }]) => { setPost(p); setComments(c); })
      .catch(() => navigate("/feed"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    const { data } = await toggleLike(post.id);
    setPost((p) => ({ ...p, is_liked: data.liked, like_count: data.like_count }));
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const { data } = await createComment({ post_id: Number(id), content: commentText });
    setComments((c) => [...c, data]);
    setCommentText("");
  };

  const handleDeleteComment = async (cid) => {
    await deleteComment(cid);
    setComments((prev) => prev.filter((c) => c.id !== cid).map((c) => ({
      ...c, replies: c.replies?.filter((r) => r.id !== cid) ?? [],
    })));
  };

  const handleDeletePost = async () => {
    if (!confirm("이 일기를 삭제할까요?")) return;
    await deletePost(id);
    navigate("/feed");
  };

  if (loading || !post) return <AppLayout title="일기" showBack><div className="flex justify-center py-10 text-gray-400">불러오는 중...</div></AppLayout>;

  return (
    <AppLayout title="일기" showBack rightAction={
      post.user_id === currentUser?.id && (
        <div className="flex gap-3">
          <Link to={`/posts/${id}/edit`} className="text-sm text-point font-semibold">수정</Link>
          <button onClick={handleDeletePost} className="text-sm text-red-400 font-semibold">삭제</button>
        </div>
      )
    }>
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center font-bold text-point">
            {post.author.name[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{post.author.name}</p>
            <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString("ko-KR")}</p>
          </div>
        </div>

        {post.image_url && (
          <img src={post.image_url} alt="" className="w-full rounded-2xl mb-4 object-cover max-h-80" />
        )}
        <p className="text-gray-800 leading-relaxed mb-4">{post.content}</p>

        <div className="flex gap-4 py-3 border-y border-gray-100 mb-4">
          <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm ${post.is_liked ? "text-red-500" : "text-gray-400"}`}>
            <span>{post.is_liked ? "❤️" : "🤍"}</span>
            <span>{post.like_count ?? 0}개</span>
          </button>
          <span className="flex items-center gap-1.5 text-sm text-gray-400">
            <span>💬</span><span>{comments.length}개</span>
          </span>
        </div>

        <div className="space-y-0 mb-4">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} currentUserId={currentUser?.id} onDelete={handleDeleteComment} />
          ))}
        </div>

        <form onSubmit={handleComment} className="flex gap-2 pb-4">
          <input
            className="input-field flex-1 text-sm"
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" className="px-4 py-2 bg-primary-400 text-white rounded-xl text-sm font-semibold">등록</button>
        </form>
      </div>
    </AppLayout>
  );
}
