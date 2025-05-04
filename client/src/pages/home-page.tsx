import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { MobileNavigation } from "@/components/mobile-navigation";
import { ProgressCard } from "@/components/progress-card";
import { ResourceCard } from "@/components/resource-card";
import { GuidanceCard } from "@/components/guidance-card";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  const { data: assessment, isLoading: assessmentLoading } = useQuery({
    queryKey: ['/api/assessment'],
  });

  const { data: guidance, isLoading: guidanceLoading } = useQuery({
    queryKey: ['/api/guidance'],
    enabled: !!assessment,
  });

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['/api/resources'],
    enabled: !!assessment,
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['/api/progress'],
    enabled: !!assessment,
  });

  // If no assessment exists, redirect to assessment page
  if (!assessmentLoading && !assessment) {
    return <Redirect to="/assessment" />;
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  const isLoading = assessmentLoading || guidanceLoading || resourcesLoading || progressLoading;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation (Desktop) */}
      <DashboardSidebar user={user} onLogout={() => logoutMutation.mutate()} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <i className="ri-code-box-line text-2xl text-primary-500 mr-2"></i>
              <h1 className="text-xl font-semibold text-gray-900">CodeMentor AI</h1>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="ri-menu-line text-2xl"></i>
            </button>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white absolute inset-x-0 top-14 z-50 border-b border-gray-200 transition">
            <nav className="px-2 py-3 space-y-1">
              <a href="#" className="block px-3 py-2 text-sm font-medium rounded-md bg-primary-50 text-primary-700">
                <i className="ri-dashboard-line mr-3 text-primary-500"></i>
                Dashboard
              </a>
              <a href="#" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                <i className="ri-book-open-line mr-3 text-gray-500"></i>
                Learning Path
              </a>
              <a href="#" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                <i className="ri-code-s-slash-line mr-3 text-gray-500"></i>
                Practice Exercises
              </a>
              <a href="#" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                <i className="ri-archive-line mr-3 text-gray-500"></i>
                Resources
              </a>
              <a href="#" className="block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                <i className="ri-settings-line mr-3 text-gray-500"></i>
                Settings
              </a>
              <div className="pt-2 mt-2 border-t border-gray-200">
                <div className="flex items-center px-3 py-2">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{user.username}</p>
                    <button 
                      onClick={() => logoutMutation.mutate()} 
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center mt-0.5"
                    >
                      <i className="ri-logout-box-line mr-1"></i> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          </div>
        )}

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {/* Welcome Section */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.username}!</h1>
                <p className="mt-1 text-gray-600">Here's your personalized coding guidance and resources.</p>
              </div>

              {/* AI Guidance */}
              {guidance && <GuidanceCard guidance={guidance} />}

              {/* Resource Recommendations */}
              {resources && resources.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {resources.map((resource, index) => (
                    <ResourceCard key={index} resource={resource} />
                  ))}
                </div>
              )}

              {/* Progress Tracking */}
              {progress && progress.length > 0 && (
                <ProgressCard progress={progress} />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
