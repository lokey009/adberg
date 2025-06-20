import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'
import { X, Play } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'signup'
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'signup'
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab)

  const handleClose = () => {
    onClose()
    // Reset to signup tab when modal closes
    setTimeout(() => setActiveTab('signup'), 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md w-full rounded-2xl shadow-2xl">
        <DialogHeader className="text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-3xl flex items-center justify-center shadow-xl">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="font-montserrat text-3xl font-bold tracking-tight">
            Welcome to medianode.ai
          </DialogTitle>
          <DialogDescription className="font-opensans text-gray-400 pt-2">
            Sign in or create an account to start creating
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex bg-gray-800/50 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2 px-4 rounded-lg font-opensans font-medium transition-all duration-300 ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 px-4 rounded-lg font-opensans font-medium transition-all duration-300 ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Form Content */}
          <div className="min-h-[400px]">
            {activeTab === 'login' ? (
              <LoginForm
                onSwitchToSignup={() => setActiveTab('signup')}
                onClose={handleClose}
              />
            ) : (
              <SignupForm
                onSwitchToLogin={() => setActiveTab('login')}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
