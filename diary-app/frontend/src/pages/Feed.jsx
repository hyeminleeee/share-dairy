import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFeed } from "../api/posts";
import { toggleLike } from "../api/likes";
import AppLayout from "../components/layout/AppLayout";

function PostCard({ post: initialPost }) {
  const [post, setPost] = useState(initialPost);

  const handleLike = async () => {
    try {
      const { data } = await toggleLike(post.id);
      setPost((p) => ({ ...p, is_liked: data.liked, like_count: data.like_count }));
    } catch {}
  };

  return (
    <div className="card mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-primary-200 flex items-center justify-center text-point font-bold text-sm">
          {post.author.name[0]}
        </div>
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
        <button onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${post.is_liked ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}>
          <span>{post.is_liked ? "❤️" : "🤍"}</span>
          <span>{post.like_count ?? 0}</span>
        </button>
        <Link to={`/posts/${post.id}`}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-point">
          <span>💬</span>
          <span>{post.comment_count ?? 0}</span>
        </Link>
      </div>
    </div>
  );
}

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeed()
      .then(({ data }) => setPosts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout title="우리의 일기장" rightAction={
      <Link to="/posts/new" className="text-point font-semibold text-sm">글쓰기</Link>
    }>
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex justify-center py-10 text-gray-400">불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <span className="text-4xl mb-3">📝</span>
            <p className="text-sm">아직 작성된 일기가 없어요</p>
            <Link to="/groups" className="mt-4 text-point text-sm font-semibold">일기장 만들기</Link>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </AppLayout>
  );
}
