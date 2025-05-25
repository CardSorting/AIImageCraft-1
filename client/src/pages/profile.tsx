import { User, Settings, Key, Bell, LogOut, Edit3, Coins, LogIn } from "lucide-react";
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

  // Fetch credit balance for mobile display
  const { data: creditBalance } = useQuery<{ balance: number }>({
    queryKey: ['/api/credit-balance/1'],
    enabled: isMobile,
    refetchInterval: 30000,
  });

  return (
    <div className={`container-responsive ${isMobile ? 'py-3 px-4' : 'py-6'}`}>
      {/* Mobile Credits Section - Compact for mobile */}
      {isMobile && isAuthenticated && (
        <section className="mb-3">
          <div 
            onClick={() => navigate('/dreamcredits')}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-lg border border-amber-200 dark:border-amber-800 cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Coins className="h-4 w-4 text-amber-900" />
              </div>
              <div>
                <div className="text-base font-bold text-foreground">
                  {creditBalance?.balance?.toLocaleString() || '150'}
                </div>
                <div className="text-xs text-muted-foreground">DreamBee Credits</div>
              </div>
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">
              Buy →
            </div>
          </div>
        </section>
      )}

      {isAuthenticated ? (
        <>
          {/* User Profile Card - Only show when authenticated */}
          <section className="mb-6 px-2">
            <UserProfile />
          </section>

          {/* Account Information */}
          <section className="mb-6 px-2">
            <h2 className="text-xl font-semibold text-foreground mb-4">Account Information</h2>
            
            <div className="card-ios space-y-2">
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-1">
                  <Input 
                    id="username" 
                    defaultValue={user?.nickname || ""} 
                    className="flex-1"
                    readOnly
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-1">
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={user?.email || ""} 
                    className="flex-1"
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <div className="flex gap-1">
                  <Input 
                    id="name" 
                    defaultValue={user?.name || ""} 
                    className="flex-1"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Privacy & Security */}
          <section className="mb-6 px-2">
            <h2 className="text-xl font-semibold text-foreground mb-4">Privacy & Security</h2>
            
            <div className="card-ios">
              <button className="list-item-ios w-full text-left">
                <Key className="h-5 w-5 text-muted-foreground mr-3" />
                <div className="flex-1">
                  <div className="font-medium text-foreground">Change Password</div>
                  <div className="text-sm text-muted-foreground">Update your password</div>
                </div>
              </button>
            </div>
          </section>

          {/* Preferences */}
          <section className="mb-6 px-2">
            <h2 className="text-xl font-semibold text-foreground mb-4">Preferences</h2>
            
            <div className="card-ios">
              <div className="list-item-ios">
                <Bell className="h-5 w-5 text-muted-foreground mr-3" />
                <div className="flex-1">
                  <div className="font-medium text-foreground">Email Notifications</div>
                  <div className="text-sm text-muted-foreground">Get updates about your account</div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="list-item-ios">
                <Settings className="h-5 w-5 text-muted-foreground mr-3" />
                <div className="flex-1">
                  <div className="font-medium text-foreground">Auto-save Images</div>
                  <div className="text-sm text-muted-foreground">Automatically save generated images</div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </section>

          <Separator className="my-4" />

          {/* Sign Out */}
          <div className="text-center px-2">
            <Button 
              variant="outline" 
              className="w-full max-w-sm"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Enhanced Sign-In Section for Non-Authenticated Users */}
          <section className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
            <div className={`text-center ${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                  <User className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-primary-foreground`} />
                </div>
                <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-foreground`}>Welcome to AI Studio</h1>
                <p className={`text-muted-foreground ${isMobile ? 'text-sm max-w-xs' : 'max-w-sm'} mx-auto`}>
                  Sign in to unlock all features, save your creations, and track your credit usage
                </p>
              </div>

              <div className={`card-ios ${isMobile ? 'p-3' : 'p-4'} max-w-sm mx-auto`}>
                <div className={`${isMobile ? 'space-y-2' : 'space-y-3'}`}>
                  <Button 
                    onClick={() => window.location.href = '/login'}
                    className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-12 text-base'}`}
                    size={isMobile ? "default" : "lg"}
                  >
                    <LogIn className={`${isMobile ? 'h-4 w-4 mr-2' : 'h-5 w-5 mr-3'}`} />
                    Sign In with Auth0
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      New to AI Studio? Sign in to get started
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits of Signing In */}
              <div className="card-ios p-4 max-w-sm mx-auto">
                <h3 className="font-semibold text-foreground mb-4 text-center">What you get when signed in:</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Settings className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-foreground">Save Your Creations</div>
                      <div className="text-muted-foreground">Access your images from any device</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Coins className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-foreground">Track Credits</div>
                      <div className="text-muted-foreground">Monitor your DreamBee Credit usage</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Bell className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-foreground">Personal Settings</div>
                      <div className="text-muted-foreground">Customize your AI Studio experience</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

    </div>
  );
}