import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api/posts';

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createPost({
        title,
        content,
        ...(coverImageUrl && { coverImageUrl }),
      });
      navigate(`/my-posts`);
    } catch (err) {
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
          <label>Cover Image URL (optional)</label>
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            style={{ width: '100%', padding: 8, display: 'block' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 16px' }}>
          Create Draft
        </button>
      </form>
    </div>
  );
}
