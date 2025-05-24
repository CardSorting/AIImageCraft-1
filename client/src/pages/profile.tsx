import { User, Settings, Key, Bell, Shield, Trash2, LogOut, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Profile() {
  return (
    <div className="container-responsive py-6">
      {/* Profile Header */}
      <header className="text-center mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <User className="text-primary-foreground w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
        <p className="text-muted-foreground text-lg">Manage your account and preferences</p>
      </header>

      {/* Account Information */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Account Information</h2>
        
        <div className="card-ios space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex gap-2">
              <Input 
                id="username" 
                defaultValue="creative_user" 
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input 
                id="email" 
                type="email" 
                defaultValue="user@example.com" 
                className="flex-1"
              />
              <Button variant="outline" size="sm">
                <Edit3 className="h-4 w-4" />
              </Button>
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
          
          <div className="list-item-ios">
            <Shield className="h-5 w-5 text-muted-foreground mr-3" />
            <div className="flex-1">
              <div className="font-medium text-foreground">Two-Factor Authentication</div>
              <div className="text-sm text-muted-foreground">Add extra security to your account</div>
            </div>
            <Switch />
          </div>
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

      {/* Danger Zone */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-red-500 mb-4">Danger Zone</h2>
        
        <div className="card-ios border-red-200 dark:border-red-800">
          <button className="list-item-ios w-full text-left">
            <Trash2 className="h-5 w-5 text-red-500 mr-3" />
            <div className="flex-1">
              <div className="font-medium text-red-500">Delete Account</div>
              <div className="text-sm text-muted-foreground">Permanently delete your account and all data</div>
            </div>
          </button>
        </div>
      </section>

      <Separator className="my-6" />

      {/* Sign Out */}
      <div className="text-center">
        <Button variant="outline" className="w-full max-w-sm">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

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