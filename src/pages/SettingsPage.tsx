import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from '@/components/settings/ProfileSettings';
import ThemeSettings from '@/components/settings/ThemeSettings';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-2xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="theme" className="mt-6">
          <ThemeSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
