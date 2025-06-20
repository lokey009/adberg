import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSwitchToSignup?: () => void
  onClose?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, onClose }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const { error } = await signIn(data.email, data.password)
      if (!error) {
        onClose?.()
        navigate('/dashboard')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    const email = getValues('email')
    if (!email) {
      return
    }

    setIsLoading(true)
    try {
      const { error } = await resetPassword(email)
      if (!error) {
        setResetEmailSent(true)
        setShowForgotPassword(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-montserrat font-bold text-2xl text-white">
          Welcome Back
        </h2>
        <p className="font-opensans text-gray-400">
          Sign in to continue creating amazing AI videos
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white font-opensans">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              autoComplete="email"
              className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-sm font-opensans">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white font-opensans">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm font-opensans">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-primary hover:text-primary/80 text-sm font-opensans transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-opensans font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 group"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </Button>
      </form>

      {resetEmailSent && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-opensans font-semibold text-white">Password Reset Sent</h3>
          </div>
          <p className="text-gray-300 font-opensans text-sm">
            We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
          </p>
        </div>
      )}

      {showForgotPassword && !resetEmailSent && (
        <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-600/50">
          <p className="text-white font-opensans text-sm mb-3">
            Enter your email address and we'll send you a password reset link.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleForgotPassword}
              disabled={isLoading || !getValues('email')}
              className="bg-primary hover:bg-primary/90 text-white font-opensans text-sm"
            >
              Send Reset Link
            </Button>
            <Button
              onClick={() => setShowForgotPassword(false)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:text-white font-opensans text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="text-center">
        <p className="text-gray-400 font-opensans">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}
