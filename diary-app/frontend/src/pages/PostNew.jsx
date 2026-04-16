import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPost } from "../api/posts";
import { listGroups } from "../api/groups";
import AppLayout from "../components/layout/AppLayout";

export default function PostNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState(searchParams.get("group") || "");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    listGroups().then(({ data }) => {
      setGroups(data);
      if (!groupId && data.length > 0) setGroupId(String(data[0].id));
    });
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupId) { setError("일기장을 선택하세요."); return; }
    setError(""); setLoading(true);
    const fd = new FormData();
    fd.append("group_id", groupId);
    fd.append("content", content);
    if (image) fd.append("image", image);
    try {
      const { data } = await createPost(fd);
      navigate(`/posts/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "일기 작성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="일기 쓰기" showBack>
      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">일기장 선택</label>
          <select className="input-field" value={groupId} onChange={(e) => setGroupId(e.target.value)} required>
            <option value="">일기장을 선택하세요</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
          <textarea
            className="input-field min-h-[200px] resize-none"
            placeholder="오늘 있었던 일을 기록해보세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div>
          <button type="button" onClick={() => fileRef.current.click()}
            className="btn-secondary text-sm">
            {preview ? "사진 변경" : "사진 추가"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          {preview && (
            <div className="mt-3 relative">
              <img src={preview} alt="미리보기" className="w-full rounded-xl object-cover max-h-64" />
              <button type="button" onClick={() => { setImage(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">
                ✕
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "등록 중..." : "일기 등록"}
        </button>
      </form>
    </AppLayout>
  );
}
