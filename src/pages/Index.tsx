import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, LogOut, User, Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AddFavorDialog } from "@/components/AddFavorDialog";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { AppSidebar } from "@/components/AppSidebar";
import { MainNavigation } from "@/components/MainNavigation";
import { NotificationSystem } from "@/components/NotificationSystem";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ResponsiveContainer } from "@/components/ResponsiveContainer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useAIRealtimeUpdates } from "@/hooks/useAIRealtimeUpdates";

const Index = () => {
  const [showAddFavor, setShowAddFavor] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Add realtime updates hook
  useAIRealtimeUpdates();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Show onboarding if user hasn't completed it
  if (profile && !profile.onboarding_completed) {
    return <OnboardingFlow onComplete={() => window.location.reload()} />;
  }

  const handleAddFavor = (favorData: any) => {
    toast({
      title: 'Favor Added Successfully',
      description: `Added "${favorData.description}" to your relationship tracking.`,
    });
    setShowAddFavor(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out successfully',
        description: "You've been signed out of your account.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: 'There was a problem signing out. Please try again.',
        variant: "destructive",
      });
    }
  };

  // Show loading while checking auth
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 dark:from-gray-950 dark:via-blue-950 dark:to-green-950 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4 animate-pulse">
            <User className="h-full w-full" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'relationships':
        return 'Relationships';
      case 'recommendations':
        return 'AI Recommendations';
      case 'analytics':
        return 'Analytics';
      case 'ai-chat':
        return 'AI Assistant';
      case 'ai-insights':
        return 'AI Insights';
      case 'automation':
        return 'Automation';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-green-50 via-blue-50 to-orange-50 dark:from-gray-950 dark:via-blue-950 dark:to-green-950">
          <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <SidebarInset className="flex-1">
            {/* Mobile Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-green-100 dark:border-gray-800 sticky top-0 z-50 lg:hidden">
              <div className="flex items-center justify-between p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </SidebarTrigger>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {getHeaderTitle()}
                  </h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Button 
                    onClick={() => setShowAddFavor(true)}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <NotificationSystem />
                </div>
              </div>
            </header>

            {/* Desktop Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-green-100 dark:border-gray-800 sticky top-0 z-50 hidden lg:block">
              <div className="flex items-center justify-between p-4 xl:p-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {getHeaderTitle()}
                  </h2>
                </div>
                
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  
                  <Button 
                    onClick={() => setShowAddFavor(true)}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Favor
                  </Button>
                  
                  <div className="hidden sm:flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <div className="text-sm">
                      <span className="text-gray-600 dark:text-gray-300">{profile?.full_name}</span>
                      {profile?.personality_type && (
                        <p className="text-xs text-green-600 dark:text-green-400">{profile.personality_type}</p>
                      )}
                    </div>
                  </div>
                  
                  <NotificationSystem />
                  
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    size="sm"
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">
              <ResponsiveContainer className="py-4 lg:py-6">
                <ErrorBoundary>
                  <MainNavigation userId={user?.id || ""} activeTab={activeTab} />
                </ErrorBoundary>
              </ResponsiveContainer>
            </main>
          </SidebarInset>
        </div>

        {/* Add Favor Dialog */}
        <AddFavorDialog 
          open={showAddFavor}
          onOpenChange={setShowAddFavor}
          onSave={handleAddFavor}
        />
      </SidebarProvider>
    </ErrorBoundary>
  );
};

export default Index;
