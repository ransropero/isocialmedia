import { useState } from 'react';
import PostComposer from './components/PostComposer';
import PostList from './components/PostList';
import AccountManager from './components/AccountManager';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { Layout, Shield } from 'lucide-react';

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowAdmin(false);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-xl text-white">
              <Layout className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Agendador de Postagem Instagram</h1>
          </div>
          <div className="flex items-center gap-4">
            {user.isAdmin && (
              <button
                onClick={() => setShowAdmin(!showAdmin)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showAdmin ? 'bg-indigo-100 text-indigo-700' : 'text-zinc-600 hover:bg-zinc-100'}`}
              >
                <Shield className="w-4 h-4" />
                {showAdmin ? 'Dashboard' : 'Painel Admin'}
              </button>
            )}
            <div className="text-sm font-medium">
              {user.email}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Sair
            </button>
          </div>
        </header>

        {showAdmin ? (
          <main>
            <AdminPanel />
          </main>
        ) : (
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <AccountManager />
              <PostComposer onPostCreated={handlePostCreated} />
            </div>

            <div className="lg:col-span-2">
              <PostList refreshTrigger={refreshTrigger} />
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
