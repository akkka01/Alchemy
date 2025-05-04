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

  // Define the types for our data
  interface Guidance {
    id: number;
    content: string;
    codeExample?: {
      title: string;
      code: string;
      language: string;
    };
  }

  interface Resource {
    id: number;
    type: string;
    title: string;
    description: string;
    duration?: string;
    level?: string;
    imageUrl?: string;
    link: string;
  }

  interface ProgressItem {
    name: string;
    percentage: number;
  }

  const { data: guidance, isLoading: guidanceLoading, error: guidanceError } = useQuery<Guidance>({
    queryKey: ['/api/guidance'],
    enabled: !!assessment,
    retry: 2,
    retryDelay: 1000,
  });

  const { data: resources, isLoading: resourcesLoading } = useQuery<Resource[]>({
    queryKey: ['/api/resources'],
    enabled: !!assessment,
    retry: 2,
    retryDelay: 1000,
  });

  const { data: progress, isLoading: progressLoading } = useQuery<ProgressItem[]>({
    queryKey: ['/api/progress'],
    enabled: !!assessment,
    retry: 2,
    retryDelay: 1000,
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
              <i className="ri-flask-fill text-3xl text-primary-600 mr-2"></i>
              <h1 className="text-2xl font-bold text-primary-600">ALCHEMY</h1>
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
              <a 
                href="/" 
                onClick={(e) => { e.preventDefault(); window.location.href = '/'; setMobileMenuOpen(false); }} 
                className="block px-3 py-2 text-sm font-medium rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
              >
                <i className="ri-dashboard-line mr-3 text-primary-500"></i>
                Dashboard
              </a>
              <button 
                onClick={() => { window.alert('Learning Path feature coming soon!'); setMobileMenuOpen(false); }} 
                className="w-full text-left block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <i className="ri-book-open-line mr-3 text-gray-500"></i>
                Learning Path
              </button>
              <button 
                onClick={() => { window.alert('Practice Exercises feature coming soon!'); setMobileMenuOpen(false); }} 
                className="w-full text-left block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <i className="ri-code-s-slash-line mr-3 text-gray-500"></i>
                Practice Exercises
              </button>
              <button 
                onClick={() => { document.getElementById('resources-section')?.scrollIntoView({ behavior: 'smooth' }); setMobileMenuOpen(false); }} 
                className="w-full text-left block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <i className="ri-archive-line mr-3 text-gray-500"></i>
                Resources
              </button>
              <button 
                onClick={() => { window.alert('Settings feature coming soon!'); setMobileMenuOpen(false); }} 
                className="w-full text-left block px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                <i className="ri-settings-line mr-3 text-gray-500"></i>
                Settings
              </button>
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
              <div className="mb-8 bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-500">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-gradient-to-br from-primary-500 to-accent-500 p-3 rounded-lg shadow-lg mr-4">
                    <i className="ri-flask-line text-3xl text-white"></i>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-primary-600">Welcome back, {user.username}!</h1>
                    <p className="mt-2 text-gray-600 text-lg">Here's your personalized coding journey with <span className="font-semibold text-primary-600">ALCHEMY</span>.</p>
                  </div>
                </div>
              </div>

              {/* AI Guidance */}
              {guidance ? (
                <GuidanceCard guidance={guidance} />
              ) : guidanceError ? (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-amber-500">
                  <h3 className="text-lg font-medium text-gray-900">Personalized Guidance Unavailable</h3>
                  <p className="mt-2 text-gray-600">
                    We're currently experiencing issues generating your personalized guidance.
                    Please try refreshing the page or check back later.
                  </p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Refresh Page
                  </button>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Loading Guidance...</h3>
                  <p className="mt-2 text-gray-600">
                    Your personalized learning guidance is being prepared. Please wait a moment.
                  </p>
                </div>
              )}

              {/* Resource Recommendations */}
              <div id="resources-section"></div>
              {resources && resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {resources.map((resource, index) => (
                    <ResourceCard key={index} resource={resource} />
                  ))}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Learning Resources</h3>
                  <p className="mt-2 text-gray-600">
                    Personalized learning resources will appear here once they're generated.
                    Try refreshing your guidance to see recommended resources.
                  </p>
                </div>
              )}

              {/* Progress Tracking */}
              {progress && progress.length > 0 ? (
                <ProgressCard progress={progress} />
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Your Learning Progress</h3>
                  <p className="mt-2 text-gray-600">
                    Your learning progress will be tracked here as you advance through your personalized path.
                    Check back soon to see your progress!
                  </p>
                </div>
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
