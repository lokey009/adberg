import { supabase } from './supabase'

export interface Project {
  id: string
  title: string
  description?: string
  status: 'draft' | 'processing' | 'completed' | 'failed'
  videoUrl?: string
  thumbnailUrl?: string
  createdAt: string
  updatedAt: string
  duration?: number
  style?: string
  voiceType?: string
  musicStyle?: string
  userId: string
}

export interface CreateProjectData {
  title: string
  description?: string
  style?: string
  voiceType?: string
  musicStyle?: string
  duration?: number
}

export interface ProjectStats {
  totalProjects: number
  completedProjects: number
  processingProjects: number
  draftProjects: number
  totalDuration: number
  creditsUsed: number
  creditsLimit: number
}

export const createProject = async (projectData: CreateProjectData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user profile to link project
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!userProfile) throw new Error('User profile not found')

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          ...projectData,
          user_id: userProfile.id,
          status: 'draft'
        }
      ])
      .select()
      .single()

    if (error) throw error
    return { project: data, error: null }
  } catch (err: any) {
    console.error('Error creating project:', err)
    return { project: null, error: err.message }
  }
}

export const getUserProjects = async (limit?: number, userId?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user profile to get the user ID
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // User profile doesn't exist, return empty projects
        return { projects: [], error: null }
      }
      throw new Error(`User profile error: ${profileError.message}`)
    }

    if (!userProfile) throw new Error('User profile not found')

    let query = supabase
      .from('projects')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) throw error
    return { projects: data || [], error: null }
  } catch (err: any) {
    console.error('Error fetching projects:', err)
    return { projects: [], error: err.message }
  }
}

export const getProjectStats = async (userId?: string): Promise<{ stats: ProjectStats | null, error: string | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, credits_used, credits_limit')
      .eq('auth_id', user.id)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // User profile doesn't exist, return default stats
        const defaultStats: ProjectStats = {
          totalProjects: 0,
          completedProjects: 0,
          processingProjects: 0,
          draftProjects: 0,
          totalDuration: 0,
          creditsUsed: 0,
          creditsLimit: 100
        }
        return { stats: defaultStats, error: null }
      }
      throw new Error(`User profile error: ${profileError.message}`)
    }

    if (!userProfile) throw new Error('User profile not found')

    // Get project statistics
    const { data: projects } = await supabase
      .from('projects')
      .select('status, duration')
      .eq('user_id', userProfile.id)

    const stats: ProjectStats = {
      totalProjects: projects?.length || 0,
      completedProjects: projects?.filter(p => p.status === 'completed').length || 0,
      processingProjects: projects?.filter(p => p.status === 'processing').length || 0,
      draftProjects: projects?.filter(p => p.status === 'draft').length || 0,
      totalDuration: projects?.reduce((sum, p) => sum + (p.duration || 0), 0) || 0,
      creditsUsed: userProfile.credits_used || 0,
      creditsLimit: userProfile.credits_limit || 100
    }

    return { stats, error: null }
  } catch (err: any) {
    console.error('Error fetching project stats:', err)
    return { stats: null, error: err.message }
  }
}

export const updateProject = async (projectId: string, updates: Partial<Project>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user profile to verify ownership
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!userProfile) throw new Error('User profile not found')

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .eq('user_id', userProfile.id)
      .select()
      .single()

    if (error) throw error
    return { project: data, error: null }
  } catch (err: any) {
    console.error('Error updating project:', err)
    return { project: null, error: err.message }
  }
}

export const deleteProject = async (projectId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user profile to verify ownership
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!userProfile) throw new Error('User profile not found')

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userProfile.id)

    if (error) throw error
    return { error: null }
  } catch (err: any) {
    console.error('Error deleting project:', err)
    return { error: err.message }
  }
}

export const getProject = async (projectId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user profile to verify ownership
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!userProfile) throw new Error('User profile not found')

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userProfile.id)
      .single()

    if (error) throw error
    return { project: data, error: null }
  } catch (err: any) {
    console.error('Error fetching project:', err)
    return { project: null, error: err.message }
  }
}
