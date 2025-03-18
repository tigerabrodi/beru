import { InputWithFeedback } from '@/components/input-with-feedback'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { handlePromise } from '@/lib/utils'
import { useAuthActions } from '@convex-dev/auth/react'
import { useActionState } from 'react'
import { toast } from 'sonner'

const SIGN_IN_STEP = 'signIn'

type FormState =
  | {
      status: 'error'
      errors: {
        email: string
      }
    }
  | {
      status: 'success'
    }

export function LoginForm() {
  const { signIn } = useAuthActions()

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_, formData) => {
      const errors = {
        email: '',
      }

      const [error] = await handlePromise(signIn('password', formData))

      if (error) {
        errors.email = 'Something went wrong.'
        return { status: 'error', errors }
      }

      toast.success('Login successful')
      return { status: 'success' }
    },
    { status: 'error', errors: { email: '' } }
  )

  return (
    <form className="flex flex-col gap-9" action={formAction}>
      <div className="flex flex-col gap-2.5">
        <input name="flow" type="hidden" value={SIGN_IN_STEP} />
        <Label htmlFor="email">Email</Label>
        <InputWithFeedback
          name="email"
          id="email"
          placeholder="naruto@konoha.com"
          type="email"
          errorMessage={state.status === 'error' ? state.errors.email : ''}
          isError={state.status === 'error' && !!state.errors.email}
        />
      </div>
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="password">Password</Label>
        <InputWithFeedback
          name="password"
          id="password"
          isError={state.status === 'error' && !!state.errors.email}
          type="password"
          helperText="Password must be at least 6 characters long"
          placeholder="********"
        />
      </div>
      <Button type="submit" isLoading={isPending} disabled={isPending}>
        Login
      </Button>
    </form>
  )
}
