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
    <div className="container-responsive py-6">
      {/* Mobile Credits and Auth Section */}
      {isMobile && (
        <section className="mb-6">
          <div className="card-ios p-4">
            {/* Credits Display */}
            <div 
              onClick={() => navigate('/dreamcredits')}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-xl border border-amber-200 dark:border-amber-800 cursor-pointer hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Coins className="h-5 w-5 text-amber-900" />
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">
                    {creditBalance?.balance?.toLocaleString() || '150'}
                  </div>
                  <div className="text-sm text-muted-foreground">DreamBee Credits</div>
                </div>
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                Tap to buy more →
              </div>
            </div>

            {/* Authentication Section */}
            <div className="mt-4 pt-4 border-t border-border/50">
              {isAuthenticated ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {user?.email?.split('@')[0] || 'User'}
                      </div>
                      <div className="text-sm text-muted-foreground">Signed in</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/logout'}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Button 
                    onClick={() => window.location.href = '/login'}
                    className="w-full"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In to Access All Features
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Sign in to save your images and track your credit usage
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {isAuthenticated ? (
        <>
          {/* User Profile Card - Only show when authenticated */}
          <section className="mb-8">
            <UserProfile />
          </section>

          {/* Account Information */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Account Information</h2>
            
            <div className="card-ios space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-2">
                  <Input 
                    id="username" 
                    defaultValue={user?.nickname || ""} 
                    className="flex-1"
                    readOnly
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={user?.email || ""} 
                    className="flex-1"
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="flex gap-2">
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
          <section className="mb-8">
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
          <section className="mb-8">
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

          <Separator className="my-6" />

          {/* Sign Out */}
          <div className="text-center">
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
          <section className="mb-8">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <div className="w-20 h-20 bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <User className="h-10 w-10 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Welcome to AI Studio</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Sign in to unlock all features, save your creations, and track your credit usage
                </p>
              </div>

              <div className="card-ios p-6 max-w-md mx-auto">
                <div className="space-y-4">
                  <Button 
                    onClick={() => window.location.href = '/login'}
                    className="w-full h-12 text-base"
                    size="lg"
                  >
                    <LogIn className="h-5 w-5 mr-3" />
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
              <div className="card-ios p-6 max-w-md mx-auto">
                <h3 className="font-semibold text-foreground mb-4 text-center">What you get when signed in:</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <Settings className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-foreground">Save Your Creations</div>
                      <div className="text-muted-foreground">Access your images from any device</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-foreground">Track Credits</div>
                      <div className="text-muted-foreground">Monitor your DreamBee Credit usage</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <Bell className="h-4 w-4 text-purple-600 dark:text-purple-400" />
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

      {/* App Info */}
      <section className="mt-8 pt-6 border-t border-border/50">
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>AI Studio v1.0</p>
          <p>Powered by Google Imagen 4</p>
          <p className="text-xs">Made with ❤️ for creators</p>
        </div>
      </section>
    </div>
  );
}