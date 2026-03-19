import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api/posts';
import { uploadCoverImage } from '../api/upload';

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let finalCoverUrl = coverImageUrl;
      if (coverFile) {
        setUploading(true);
        const { data } = await uploadCoverImage(coverFile);
        finalCoverUrl = data.url;
        setUploading(false);
      }
      await createPost({
        title,
        content,
        ...(finalCoverUrl && { coverImageUrl: finalCoverUrl }),
      });
      navigate('/my-posts');
    } catch (err) {
      setUploading(false);
      setError(
        err.response?.data?.message ||
          err.response?.data?.message?.[0] ||
          'Failed to create post'
      );
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 20 }}>
      <h1>Create Post</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ marginBottom: 10 }}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: 8, display: 'block' }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            style={{ width: '100%', padding: 8, display: 'block' }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Cover Image (optional)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => {
              setCoverFile(e.target.files?.[0] || null);
              setCoverImageUrl('');
            }}
            style={{ width: '100%', padding: 8, display: 'block' }}
          />
          <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Or paste URL:{' '}
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => {
                setCoverImageUrl(e.target.value);
                setCoverFile(null);
              }}
              placeholder="https://..."
              style={{ width: '100%', padding: 6, marginTop: 4 }}
            />
          </p>
        </div>
        <button
          type="submit"
          style={{ padding: '8px 16px' }}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Create Draft'}
        </button>
      </form>
    </div>
  );
}
