import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { createUser, getUserByAuthId } from '@/lib/userService'
import { linkAnonymousConsultations } from '@/lib/consultationService'
import { toast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === 'SIGNED_IN' && session?.user) {
        // Check if user profile exists, create if not
        const { user: existingUser, error: getUserError } = await getUserByAuthId(session.user.id)

        if (!existingUser && !getUserError) {
          await createUser({
            authId: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            company: session.user.user_metadata?.company,
          })
        }

        // Link any anonymous consultations to this user
        if (session.user.email) {
          try {
            const { linkedCount } = await linkAnonymousConsultations(session.user.email)
            if (linkedCount > 0) {
              toast({
                title: "Consultations linked!",
                description: `We found ${linkedCount} previous consultation${linkedCount > 1 ? 's' : ''} and linked them to your account.`,
              })
            }
          } catch (err) {
            console.error('Error linking consultations:', err)
          }
        }

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        })
      } else if (event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      })
    }

    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      })
    }

    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      })
    }

    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
