import React from "react";

// Zero external dependencies - pure React + Tailwind
const App = () => {
  const [currentPage, setCurrentPage] = React.useState(
    window.location.pathname === '/login' ? 'login' : 'dashboard'
  );
  const [user, setUser] = React.useState(null);

  // Simple auth simulation
  const login = () => {
    setUser({ name: 'Super Admin', role: 'super_admin' });
    setCurrentPage('dashboard');
    window.history.pushState({}, '', '/');
  };

  const logout = () => {
    setUser(null);
    setCurrentPage('login');
    window.history.pushState({}, '', '/login');
  };

  const navigate = (page: string, path: string) => {
    setCurrentPage(page);
    window.history.pushState({}, '', path);
  };

  // Login Page
  if (!user || currentPage === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Hiban Analytics</h2>
            <p className="mt-2 text-gray-600">Marketplace Analytics Dashboard</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={login}
              className="w-full py-2 px-4 border border-transparent text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium"
            >
              Sign in
            </button>
            <p className="text-center text-xs text-gray-500">
              Demo: Use any email/password to login
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Layout with Sidebar
  const menuItems = [
    { name: 'Dashboard', page: 'dashboard', path: '/', icon: '📊' },
    { name: 'Upload Data', page: 'upload', path: '/upload', icon: '📤' },
    { name: 'Input Manual', page: 'manual', path: '/manual-input', icon: '✏️' },
    { name: 'Analytics', page: 'analytics', path: '/analytics', icon: '📈' },
    { name: 'Products', page: 'products', path: '/products', icon: '📦' },
    { name: 'Stores', page: 'stores', path: '/stores', icon: '🏪' },
    { name: 'Users', page: 'users', path: '/users', icon: '👥' },
    { name: 'Settings', page: 'settings', path: '/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="ml-3 text-xl font-bold text-gray-900">Hiban Analytics</h1>
          </div>
        </div>
        
        <nav className="mt-6">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.page}>
                <button
                  onClick={() => navigate(item.page, item.path)}
                  className={`w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === item.page
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                  {item.page !== 'dashboard' && (
                    <span className="ml-auto text-xs text-gray-400">Soon</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">SA</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Super Admin</p>
                <p className="text-xs text-gray-500">admin@hibanstore.com</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1 rounded text-gray-400 hover:text-gray-600"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              {menuItems.find(item => item.page === currentPage)?.name || 'Dashboard'}
            </h1>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        <main className="p-6">
          {currentPage === 'dashboard' && (
            <div>
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                  <h2 className="text-2xl font-bold mb-2">Selamat Datang di Dashboard Analytics!</h2>
                  <p>Monitor performa bisnis marketplace Anda dengan data real-time.</p>
                  <div className="mt-4 text-sm opacity-90">
                    Super Admin | Periode: Juli 2025
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { title: 'Total Revenue', value: 'Rp 12.540.000', change: '+15.2%', color: 'green' },
                  { title: 'Total Profit', value: 'Rp 6.270.000', change: '+12.8%', color: 'blue' },
                  { title: 'Total Orders', value: '1.456', change: '+8.1%', color: 'purple' },
                  { title: 'Growth Rate', value: '+18.5%', change: '+3.2%', color: 'orange' }
                ].map((stat, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{stat.title}</h3>
                    <p className={`text-2xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.change} from last month</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => navigate('upload', '/upload')}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-2xl mb-2">📤</div>
                      <div className="font-medium">Upload Data</div>
                      <div className="text-xs text-gray-500">Import CSV files</div>
                    </button>
                    <button 
                      onClick={() => navigate('manual', '/manual-input')}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
                    >
                      <div className="text-2xl mb-2">✏️</div>
                      <div className="font-medium">Input Manual</div>
                      <div className="text-xs text-gray-500">Add transactions</div>
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Latest Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">New order from Shopee - Rp 45.000</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Data uploaded - 150 transactions</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Analytics report generated</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage !== 'dashboard' && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-6xl mb-4">
                {menuItems.find(item => item.page === currentPage)?.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {menuItems.find(item => item.page === currentPage)?.name}
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready for Development!</h3>
                <p className="text-blue-800 text-sm">
                  This page will be implemented with our 40-credit budget. 
                  Foundation is stable, now we can add functionality efficiently.
                </p>
                <div className="mt-4 text-xs text-blue-600">
                  🚀 Clean Architecture | ⚡ Zero Dependencies | 💪 40 Credits Ready
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;