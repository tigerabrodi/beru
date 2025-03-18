import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ROUTES, TAB_VALUES } from '@/lib/constants'
import { api } from '@convex/_generated/api'
import { useConvexAuth, useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { generatePath, useNavigate } from 'react-router'
import { LoginForm } from './components/login-form'
import { RegisterForm } from './components/register-form'

export function LoginPage() {
  const [tab, setTab] = useState<
    typeof TAB_VALUES.LOGIN | typeof TAB_VALUES.REGISTER
  >(TAB_VALUES.LOGIN)

  const user = useQuery(api.users.queries.getCurrentUser)
  const state = useConvexAuth()
  const isLoading = user === undefined || state.isLoading
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && user) {
      void navigate(generatePath(ROUTES.dashboard))
    }
  }, [isLoading, user, navigate])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-1">
          <CardTitle className="text-primary flex items-center justify-center gap-2 text-center text-2xl">
            Beru
            <span className="text-2xl">📚</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={tab}
            onValueChange={(value) =>
              setTab(value as (typeof TAB_VALUES)[keyof typeof TAB_VALUES])
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value={TAB_VALUES.LOGIN}>Login</TabsTrigger>
              <TabsTrigger value={TAB_VALUES.REGISTER}>Register</TabsTrigger>
            </TabsList>

            <TabsContent value={TAB_VALUES.LOGIN} className="pt-4">
              <LoginForm />
            </TabsContent>

            <TabsContent value={TAB_VALUES.REGISTER} className="pt-4">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
