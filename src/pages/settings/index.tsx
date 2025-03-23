import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { ApiKeySettings } from './components/api-key'
import { ChildProfileSettings } from './components/child-profile'
import { VoicePresetSettings } from './components/voice-presets'

type Tab = 'api-keys' | 'child-profiles' | 'voice-presets'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('api-keys')

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your API keys, child profiles, and voice presets
        </p>
      </div>

      <Card>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as Tab)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
              <TabsTrigger value="child-profiles">Child Profiles</TabsTrigger>
              <TabsTrigger value="voice-presets">Voice Presets</TabsTrigger>
            </TabsList>

            <div className="p-6">
              <div>
                <TabsContent value="api-keys">
                  <ApiKeySettings />
                </TabsContent>

                <TabsContent value="child-profiles">
                  <ChildProfileSettings />
                </TabsContent>

                <TabsContent value="voice-presets">
                  <VoicePresetSettings />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
