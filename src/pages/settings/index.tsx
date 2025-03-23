import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePrefetchQuery } from '@/hooks/use-prefetch-query'
import { api } from '@convex/_generated/api'
import { useState } from 'react'
import { ApiKeySettings } from './components/api-key'
import { ChildProfileSettings } from './components/child-profile'
import { VoicePresetSettings } from './components/voice-presets'

type Tab = 'api-keys' | 'child-profiles' | 'voice-presets'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('api-keys')
  const prefetchChildProfiles = usePrefetchQuery(
    api.childProfiles.queries.getChildProfiles
  )
  const prefetchVoicePresets = usePrefetchQuery(
    api.voicePresets.queries.getVoicePresets
  )

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
              <TabsTrigger
                value="child-profiles"
                onMouseEnter={() => prefetchChildProfiles({})}
              >
                Child Profiles
              </TabsTrigger>
              <TabsTrigger
                value="voice-presets"
                onMouseEnter={() => prefetchVoicePresets({})}
              >
                Voice Presets
              </TabsTrigger>
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
