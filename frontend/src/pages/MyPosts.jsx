import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyPosts, publishPost, deletePost } from '../api/posts';

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = () => {
    setLoading(true);
    getMyPosts()
      .then(({ data }) => setPosts(data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load posts'))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadPosts(), []);

  const handlePublish = async (id) => {
    try {
      await publishPost(id);
      loadPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deletePost(id);
      loadPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: 20 }}>
      <h1>My Posts</h1>
      <Link to="/create-post" style={{ display: 'inline-block', marginBottom: 20 }}>
        Create New Post
      </Link>
      {posts.length === 0 ? (
        <p>You have no posts yet.</p>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Link
                    to={
                      post.status === 'PUBLISHED'
                        ? `/posts/${post.id}`
                        : `/my-posts/${post.id}/edit`
                    }
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <h3 style={{ margin: '0 0 8px 0' }}>{post.title}</h3>
                  </Link>
                  <span
                    style={{
                      fontSize: 12,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: post.status === 'PUBLISHED' ? '#d4edda' : '#fff3cd',
                    }}
                  >
                    {post.status}
                  </span>
                  <p style={{ margin: '8px 0 0 0' }}>
                    {post.content?.substring(0, 100)}
                    {post.content?.length > 100 ? '...' : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {post.status === 'DRAFT' && (
                    <button
                      onClick={() => handlePublish(post.id)}
                      style={{ padding: '4px 12px', fontSize: 12 }}
                    >
                      Publish
                    </button>
                  )}
                  <Link to={`/my-posts/${post.id}/edit`}>
                    <button style={{ padding: '4px 12px', fontSize: 12 }}>
                      Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    style={{ padding: '4px 12px', fontSize: 12, color: 'red' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
