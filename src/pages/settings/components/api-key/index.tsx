import { InputWithFeedback } from '@/components/input-with-feedback'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { handlePromise } from '@/lib/utils'
import { api } from '@convex/_generated/api'
import { useAction } from 'convex/react'
import { Eye, EyeOff } from 'lucide-react'
import { useActionState, useState } from 'react'
import { toast } from 'sonner'

type FormState = {
  status: 'error' | 'success' | 'idle'
}

export function ApiKeySettings() {
  const [openAIKey, setOpenAIKey] = useState('')
  const [humeAIKey, setHumeAIKey] = useState('')
  const [showOpenAIKey, setShowOpenAIKey] = useState(false)
  const [showHumeAIKey, setShowHumeAIKey] = useState(false)

  const storeOpenAiApiKey = useAction(api.users.actions.storeOpenAiApiKey)
  const storeHumeAiApiKey = useAction(api.users.actions.storeHumeApiKey)

  const [, formAction, isSaving] = useActionState<FormState, FormData>(
    async (_, formData) => {
      const openAIKey = formData.get('openaiApiKey') as string
      const humeAIKey = formData.get('humeApiKey') as string

      if (!openAIKey || !humeAIKey) {
        toast.error('Please enter both API keys')
        return { status: 'error' }
      }

      const [openAiError] = await handlePromise(
        storeOpenAiApiKey({ apiKey: openAIKey })
      )

      if (openAiError) {
        toast.error('Failed to store OpenAI API key')
        return { status: 'error' }
      }

      const [humeAiError] = await handlePromise(
        storeHumeAiApiKey({ apiKey: humeAIKey })
      )

      if (humeAiError) {
        toast.error('Failed to store Hume API key')
        return { status: 'error' }
      }

      return { status: 'success' }
    },
    { status: 'idle' }
  )

  return (
    <form className="flex flex-col gap-6" action={formAction}>
      <div>
        <h2 className="mb-2 text-xl font-bold">API Keys</h2>
        <p className="text-muted-foreground">
          Provide your API keys to enable story generation and voice synthesis
        </p>
      </div>

      <Card className="pb-6">
        <CardHeader>
          <CardTitle>OpenAI API Key</CardTitle>
          <CardDescription>
            Required for generating personalized stories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="openai-key">API Key</Label>
              <div className="mt-1">
                <InputWithFeedback
                  id="openai-key"
                  name="openaiApiKey"
                  type={showOpenAIKey ? 'text' : 'password'}
                  value={openAIKey}
                  onChange={(event) => setOpenAIKey(event.target.value)}
                  placeholder="sk-..."
                  trailingElement={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setShowOpenAIKey((prev) => !prev)}
                    >
                      {showOpenAIKey ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                      <span className="sr-only">
                        {showOpenAIKey ? 'Hide' : 'Show'} API Key
                      </span>
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="pb-6">
        <CardHeader>
          <CardTitle>Hume.ai API Key</CardTitle>
          <CardDescription>
            Required for generating voice narration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="hume-key">API Key</Label>
              <div className="mt-1">
                <InputWithFeedback
                  id="hume-key"
                  name="humeApiKey"
                  type={showHumeAIKey ? 'text' : 'password'}
                  value={humeAIKey}
                  onChange={(event) => setHumeAIKey(event.target.value)}
                  placeholder="hume_..."
                  trailingElement={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setShowHumeAIKey((prev) => !prev)}
                    >
                      {showHumeAIKey ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                      <span className="sr-only">
                        {showHumeAIKey ? 'Hide' : 'Show'} API Key
                      </span>
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        disabled={isSaving}
        type="submit"
        className="w-full md:w-auto md:self-end"
      >
        {isSaving ? (
          <>
            <div className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            Saving...
          </>
        ) : (
          'Save API Keys'
        )}
      </Button>
    </form>
  )
}
