import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPost, updatePost } from "../api/posts";
import AppLayout from "../components/layout/AppLayout";

export default function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState(null); // 서버에 저장된 원본
  const [image, setImage] = useState(null);   // 새로 선택한 파일
  const [preview, setPreview] = useState(null); // 화면에 표시할 미리보기 URL
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    getPost(id).then(({ data }) => {
      setContent(data.content);
      if (data.image_url) {
        setOriginalImageUrl(data.image_url);
        setPreview(data.image_url);
      }
    }).catch(() => navigate("/feed"));
  }, [id]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    // originalImageUrl은 유지 — submit 시 remove_image 플래그 판단에 사용
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData();
    fd.append("content", content);

    if (image) {
      // 새 사진으로 교체
      fd.append("image", image);
    } else if (!preview && originalImageUrl) {
      // 기존 사진이 있었는데 사용자가 제거한 경우
      fd.append("remove_image", "true");
    }

    try {
      await updatePost(id, fd);
      navigate(`/posts/${id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="일기 수정" showBack>
      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
          <textarea
            className="input-field min-h-[200px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div>
          <button type="button" onClick={() => fileRef.current.click()} className="btn-secondary text-sm">
            {preview ? "사진 변경" : "사진 추가"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          {preview && (
            <div className="mt-3 relative">
              <img src={preview} alt="미리보기" className="w-full rounded-xl object-cover max-h-64" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "수정 중..." : "수정 완료"}
        </button>
      </form>
    </AppLayout>
  );
}
