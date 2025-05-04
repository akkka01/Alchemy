import { User } from "@shared/schema";

interface DashboardSidebarProps {
  user: User;
  onLogout: () => void;
}

export function DashboardSidebar({ user, onLogout }: DashboardSidebarProps) {
  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <i className="ri-code-box-line text-2xl text-primary-500 mr-2"></i>
          <h1 className="text-xl font-semibold text-gray-900">CodeMentor AI</h1>
        </div>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        <a href="#" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary-50 text-primary-700">
          <i className="ri-dashboard-line mr-3 text-primary-500"></i>
          Dashboard
        </a>
        <a href="#" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
          <i className="ri-book-open-line mr-3 text-gray-500"></i>
          Learning Path
        </a>
        <a href="#" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
          <i className="ri-code-s-slash-line mr-3 text-gray-500"></i>
          Practice Exercises
        </a>
        <a href="#" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
          <i className="ri-archive-line mr-3 text-gray-500"></i>
          Resources
        </a>
        <a href="#" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
          <i className="ri-settings-line mr-3 text-gray-500"></i>
          Settings
        </a>
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
