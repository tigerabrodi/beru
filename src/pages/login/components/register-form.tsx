import { InputWithFeedback } from '@/components/input-with-feedback'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { handlePromise } from '@/lib/utils'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '@convex/_generated/api'
import { useConvex } from 'convex/react'
import { useActionState } from 'react'
import { toast } from 'sonner'

const SIGN_UP_STEP = 'signUp'

const PASSWORD_MIN_LENGTH = 6

type FormState =
  | {
      status: 'error'
      errors: {
        email: string
        password: string
      }
    }
  | {
      status: 'success'
    }

export function RegisterForm() {
  const convex = useConvex()
  const { signIn } = useAuthActions()

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_, formData) => {
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      const confirmPassword = formData.get('confirmPassword') as string

      const errors = {
        email: '',
        password: '',
      }

      if (password.length < PASSWORD_MIN_LENGTH) {
        errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`
        return { status: 'error', errors }
      }

      if (password !== confirmPassword) {
        errors.password = 'Passwords do not match'
        return { status: 'error', errors }
      }

      const [existingUserError, existingUser] = await handlePromise(
        convex.query(api.users.queries.getUserByEmail, { email })
      )

      if (existingUserError) {
        errors.email =
          'Something went wrong during registration. Please try later.'
        return { status: 'error', errors }
      }

      if (existingUser) {
        errors.email = 'Email already exists'
        return { status: 'error', errors }
      }

      const [error] = await handlePromise(signIn('password', formData))

      if (error) {
        errors.email =
          'Something went wrong during registration. Please try later.'
        return { status: 'error', errors }
      }

      toast.success('Registration successful')
      return { status: 'success' }
    },
    { status: 'error', errors: { email: '', password: '' } }
  )

  return (
    <form action={formAction} className="flex flex-col gap-9">
      <input name="flow" type="hidden" value={SIGN_UP_STEP} />
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="email">Email</Label>
        <InputWithFeedback
          name="email"
          id="email"
          placeholder="naruto@konoha.com"
          type="email"
          errorMessage={state.status === 'error' ? state.errors?.email : ''}
          isError={state.status === 'error' && !!state.errors?.email}
          required
        />
      </div>
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="password">Password</Label>
        <InputWithFeedback
          name="password"
          id="password"
          errorMessage={state.status === 'error' ? state.errors?.password : ''}
          isError={state.status === 'error' && !!state.errors?.password}
          required
          type="password"
          helperText="Password must be at least 6 characters long"
          placeholder="********"
        />
      </div>
      <div className="flex flex-col gap-2.5">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <InputWithFeedback
          name="confirmPassword"
          id="confirmPassword"
          required
          // just show error border if any password errors
          isError={state.status === 'error' && !!state.errors?.password}
          type="password"
          placeholder="********"
        />
      </div>
      <Button type="submit" isLoading={isPending} disabled={isPending}>
        Register
      </Button>
    </form>
  )
}
