import { User } from "@shared/schema";

interface DashboardSidebarProps {
  user: User;
  onLogout: () => void;
}

export function DashboardSidebar({ user, onLogout }: DashboardSidebarProps) {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <div className="flex items-center p-2">
            <i className="ri-flask-fill text-3xl text-primary-600 mr-2"></i>
            <h1 className="text-2xl font-bold text-primary-600">ALCHEMY</h1>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); window.location.href = '/'; }} 
          className="group flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
        >
          <i className="ri-dashboard-line mr-3 text-primary-500"></i>
          Dashboard
        </a>
        <button 
          onClick={() => window.alert('Learning Path feature coming soon!')} 
          className="w-full text-left group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
        >
          <i className="ri-book-open-line mr-3 text-gray-500 group-hover:text-primary-500"></i>
          Learning Path
        </button>
        <button 
          onClick={() => window.alert('Practice Exercises feature coming soon!')} 
          className="w-full text-left group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
        >
          <i className="ri-code-s-slash-line mr-3 text-gray-500 group-hover:text-primary-500"></i>
          Practice Exercises
        </button>
        <button 
          onClick={() => document.getElementById('resources-section')?.scrollIntoView({ behavior: 'smooth' })} 
          className="w-full text-left group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
        >
          <i className="ri-archive-line mr-3 text-gray-500 group-hover:text-primary-500"></i>
          Resources
        </button>
        <button 
          onClick={() => window.alert('Settings feature coming soon!')} 
          className="w-full text-left group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
        >
          <i className="ri-settings-line mr-3 text-gray-500 group-hover:text-primary-500"></i>
          Settings
        </button>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user.username}</p>
            <button 
              onClick={onLogout} 
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center mt-0.5"
            >
              <i className="ri-logout-box-line mr-1"></i> Sign Out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
