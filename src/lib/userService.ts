import { supabase } from './supabase'

export interface CreateUserData {
  authId: string
  email: string
  name?: string
  company?: string
}

export const createUser = async (userData: CreateUserData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          auth_id: userData.authId,
          email: userData.email,
          name: userData.name,
          company: userData.company,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return { user: null, error }
    }

    return { user: data, error: null }
  } catch (err) {
    console.error('Unexpected error creating user:', err)
    return { user: null, error: err }
  }
}

export const getUserByAuthId = async (authId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching user:', error)
      return { user: null, error }
    }

    return { user: data, error: null }
  } catch (err) {
    console.error('Unexpected error fetching user:', err)
    return { user: null, error: err }
  }
}

export const updateUser = async (authId: string, updates: Partial<CreateUserData>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('auth_id', authId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return { user: null, error }
    }

    return { user: data, error: null }
  } catch (err) {
    console.error('Unexpected error updating user:', err)
    return { user: null, error: err }
  }
}
