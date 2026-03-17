import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPost } from '../api/posts';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPost(id)
      .then(({ data }) => setPost(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load post'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!post) return null;

  return (
    <article style={{ maxWidth: 800, margin: '40px auto', padding: 20 }}>
      <h1>{post.title}</h1>
      <p style={{ color: '#666', fontSize: 14 }}>
        {post.author?.email} • {new Date(post.createdAt).toLocaleDateString()}
      </p>
      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt=""
          style={{ maxWidth: '100%', marginBottom: 16 }}
        />
      )}
      <div style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
    </article>
  );
}
