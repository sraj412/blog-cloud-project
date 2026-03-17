import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedPosts } from '../api/posts';

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPublishedPosts()
      .then(({ data }) => setPosts(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load posts'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 20 }}>
      <h1>Blog</h1>
      {posts.length === 0 ? (
        <p>No published posts yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {posts.map((post) => (
            <li
              key={post.id}
              style={{
                border: '1px solid #ddd',
                padding: 16,
                marginBottom: 12,
                borderRadius: 4,
              }}
            >
              <Link to={`/posts/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3 style={{ margin: '0 0 8px 0' }}>{post.title}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                  {post.author?.email} • {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p style={{ margin: '8px 0 0 0' }}>
                  {post.content?.substring(0, 150)}
                  {post.content?.length > 150 ? '...' : ''}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
