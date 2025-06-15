import { User, Settings, Key, Bell, LogOut, Edit3, Coins, LogIn, ChevronRight, Camera, Mail, Lock, Palette, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { UserProfile } from "@/components/AuthStatus";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const isMobile = useIsMobile();

  // Fetch credit balance
  const { data: creditBalance } = useQuery<{ balance: number }>({
    queryKey: ['/api/credit-balance/1'],
    enabled: isAuthenticated,
    refetchInterval: false,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="container max-w-md mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/25">
              <User className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
              Welcome to Dream Bees Art
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Sign in to unlock the full creative experience
            </p>
          </div>

          {/* Sign In Card */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50 mb-8">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              <LogIn className="h-6 w-6 mr-3" />
              Click to Sign In
            </Button>
          </div>

          {/* Features Grid */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white text-center mb-6">
              What awaits you
            </h3>

            <div className="grid gap-4">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Save Creations</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Access from anywhere</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Credit Management</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Track your usage</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                    <Palette className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Personal Experience</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Tailored for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 mb-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-100 dark:border-slate-700">
                <Camera className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.email?.split('@')[0] || "Welcome"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Credits Card */}
        <div 
          onClick={() => navigate('/dreamcredits')}
          className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-6 mb-6 shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {creditBalance?.balance?.toLocaleString() || '150'}
                </div>
                <div className="text-amber-100">DreamBee Credits</div>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-white/80" />
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl mb-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Account</h2>
          </div>

          <div className="space-y-px">
            <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Email</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{user?.email}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Password</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Change your password</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl mb-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Preferences</h2>
          </div>

          <div className="space-y-px">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Notifications</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Email updates</div>
                </div>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
            </div>

            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">Auto-save</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Save images automatically</div>
                </div>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-blue-600" />
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 overflow-hidden mb-8">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center px-6 py-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="h-5 w-5 text-red-600 dark:text-red-400 mr-3" />
            <span className="font-medium text-red-600 dark:text-red-400">Sign Out</span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-slate-900 dark:text-white">Dream Bees Art</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Powered by Google Imagen 4</p>
          <p className="text-xs text-slate-500 dark:text-slate-500">Version 1.0</p>
        </div>
      </div>
    </div>
  );
}