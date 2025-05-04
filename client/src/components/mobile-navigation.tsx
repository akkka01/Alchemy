export function MobileNavigation() {
  return (
    <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
      <div className="grid grid-cols-5">
        <a href="#" className="flex flex-col items-center py-2 text-primary-600">
          <i className="ri-dashboard-line text-xl"></i>
          <span className="text-xs mt-1">Dashboard</span>
        </a>
        <a href="#" className="flex flex-col items-center py-2 text-gray-500">
          <i className="ri-book-open-line text-xl"></i>
          <span className="text-xs mt-1">Learning</span>
        </a>
        <a href="#" className="flex flex-col items-center py-2 text-gray-500">
          <i className="ri-code-s-slash-line text-xl"></i>
          <span className="text-xs mt-1">Practice</span>
        </a>
        <a href="#" className="flex flex-col items-center py-2 text-gray-500">
          <i className="ri-archive-line text-xl"></i>
          <span className="text-xs mt-1">Resources</span>
        </a>
        <a href="#" className="flex flex-col items-center py-2 text-gray-500">
          <i className="ri-user-line text-xl"></i>
          <span className="text-xs mt-1">Profile</span>
        </a>
      </div>
    </nav>
  );
}
