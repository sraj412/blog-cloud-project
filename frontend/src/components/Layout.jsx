import { Outlet, Link } from 'react-router-dom';

export default function Layout() {
  const token = localStorage.getItem('token');

  return (
    <div>
      <nav
        style={{
          borderBottom: '1px solid #ddd',
          padding: '16px 24px',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <Link to="/">Blog</Link>
        {token ? (
          <>
            <Link to="/create-post">Create Post</Link>
            <Link to="/my-posts">My Posts</Link>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
