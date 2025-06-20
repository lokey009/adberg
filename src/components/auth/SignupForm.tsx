import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Building, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

interface SignupFormProps {
  onSwitchToLogin?: () => void
  onClose?: () => void
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onClose }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailSent, setShowEmailSent] = useState(false)
  const { signUp } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    try {
      const { error } = await signUp(data.email, data.password, {
        name: data.name,
        company: data.company,
      })
      if (!error) {
        setShowEmailSent(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (showEmailSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-montserrat font-bold text-2xl text-white">
            Check Your Email
          </h2>
          <p className="font-opensans text-gray-300 leading-relaxed">
            We've sent you a confirmation link at your email address. Please check your inbox and click the link to activate your account.
          </p>
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
            <p className="font-opensans text-primary text-sm">
              💡 Don't forget to check your spam folder if you don't see the email in your inbox.
            </p>
          </div>
        </div>
        <Button
          onClick={onSwitchToLogin}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:text-white font-opensans"
        >
          Back to Sign In
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="font-montserrat font-bold text-2xl text-white">
          Create Your Account
        </h2>
        <p className="font-opensans text-gray-400">
          Join thousands of creators making AI videos
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white font-opensans">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary"
              {...register('name')}
            />
          </div>
          {errors.name && (
            <p className="text-red-400 text-sm font-opensans">{errors.name.message}</p>
          )}
        </div>

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
          <Label htmlFor="company" className="text-white font-opensans">
            Company <span className="text-gray-400">(Optional)</span>
          </Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="company"
              type="text"
              placeholder="Enter your company name"
              autoComplete="organization"
              className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary"
              {...register('company')}
            />
          </div>
          {errors.company && (
            <p className="text-red-400 text-sm font-opensans">{errors.company.message}</p>
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
              placeholder="Create a strong password"
              autoComplete="new-password"
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white font-opensans">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              autoComplete="new-password"
              className="pl-10 pr-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm font-opensans">{errors.confirmPassword.message}</p>
          )}
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
              Create Account
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-gray-400 font-opensans text-sm">
          By creating an account, you agree to our{' '}
          <a href="#" className="text-primary hover:text-primary/80 transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-primary hover:text-primary/80 transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>

      <div className="text-center">
        <p className="text-gray-400 font-opensans">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
