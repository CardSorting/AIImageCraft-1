import { User, Settings, Key, Bell, LogOut, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { UserProfile } from "@/components/AuthStatus";
import { useAuth } from "@/hooks/useAuth";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="container-responsive py-6">
      {/* User Profile Card */}
      <section className="mb-8">
        <UserProfile />
      </section>

      {isAuthenticated && (
        <>
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
        </>
      )}

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
      {isAuthenticated && (
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