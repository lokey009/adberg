import { supabase } from './supabase'

export interface ConsultationRequest {
  id: string
  userId?: string // Optional - for anonymous submissions
  name: string
  email: string
  company?: string
  phone?: string
  projectType: string
  budget?: string
  timeline?: string
  targetAudience?: string
  currentMarketing?: string
  goals?: string
  message?: string
  
  // Enhanced fields for quote conversion
  title?: string
  description?: string
  complexity?: 'basic' | 'standard' | 'premium'
  brandGuidelines?: string
  urgency?: 'standard' | 'rush'
  additionalRequirements?: string
  
  // Status and metadata
  status: 'new' | 'contacted' | 'quote_requested' | 'quoted' | 'converted' | 'closed'
  source: 'homepage' | 'dashboard' | 'referral'
  isAnonymous: boolean
  
  // Pricing (when converted to quote)
  basePrice?: number
  totalPrice?: number
  validUntil?: string
  
  createdAt: string
  updatedAt: string
}

export interface CreateConsultationData {
  // Basic contact info (required)
  name: string
  email: string
  company?: string
  phone?: string
  
  // Project details
  projectType: string
  budget?: string
  timeline?: string
  targetAudience?: string
  currentMarketing?: string
  goals?: string
  message?: string
  
  // Enhanced fields (optional)
  title?: string
  description?: string
  complexity?: 'basic' | 'standard' | 'premium'
  brandGuidelines?: string
  urgency?: 'standard' | 'rush'
  additionalRequirements?: string
  
  // Metadata
  source: 'homepage' | 'dashboard' | 'referral'
}

// Create consultation request (works for both anonymous and authenticated users)
export const createConsultation = async (data: CreateConsultationData) => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    let userId = null
    let enhancedData = { ...data }

    if (user) {
      // Get user profile with full details
      const { data: userProfile } = await supabase
        .from('users')
        .select('id, name, email, company, phone')
        .eq('auth_id', user.id)
        .single()

      if (userProfile) {
        userId = userProfile.id

        // Auto-fill user data if not provided
        if (!enhancedData.name && userProfile.name) {
          enhancedData.name = userProfile.name
        }
        if (!enhancedData.email && userProfile.email) {
          enhancedData.email = userProfile.email
        }
        if (!enhancedData.company && userProfile.company) {
          enhancedData.company = userProfile.company
        }
        if (!enhancedData.phone && userProfile.phone) {
          enhancedData.phone = userProfile.phone
        }
      }
    }

    // Determine initial status based on source and user authentication
    let initialStatus = 'new'
    if (enhancedData.source === 'dashboard' && userId) {
      initialStatus = 'quote_requested'
    }

    // Create consultation request
    const consultationData = {
      ...enhancedData,
      user_id: userId,
      is_anonymous: !userId,
      status: initialStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: consultation, error } = await supabase
      .from('consultation_requests')
      .insert([consultationData])
      .select()
      .single()
    
    if (error) throw error
    
    return { consultation, error: null }
  } catch (err: any) {
    console.error('Error creating consultation:', err)
    return { consultation: null, error: err.message }
  }
}

// Convert consultation to detailed quote (authenticated users only)
export const convertToQuote = async (consultationId: string, quoteData: Partial<CreateConsultationData>) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user profile with full details
    const { data: userProfile } = await supabase
      .from('users')
      .select('id, name, email, company, phone')
      .eq('auth_id', user.id)
      .single()

    if (!userProfile) throw new Error('User profile not found')

    // Calculate pricing if we have the required data
    let pricingData = {}
    if (quoteData.projectType && quoteData.complexity) {
      // Import the pricing calculation function
      const { calculateQuotePrice } = await import('./quoteService')
      const pricing = calculateQuotePrice(
        quoteData.projectType as any,
        quoteData.complexity as any,
        quoteData.urgency || 'standard' as any
      )

      pricingData = {
        base_price: pricing.basePrice,
        total_price: pricing.totalPrice,
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      }
    }

    // Update consultation with enhanced data
    const updateData = {
      ...quoteData,
      user_id: userProfile.id,
      is_anonymous: false,
      status: 'quote_requested',
      updated_at: new Date().toISOString(),
      ...pricingData
    }
    
    const { data: consultation, error } = await supabase
      .from('consultation_requests')
      .update(updateData)
      .eq('id', consultationId)
      .select()
      .single()
    
    if (error) throw error
    
    return { consultation, error: null }
  } catch (err: any) {
    console.error('Error converting to quote:', err)
    return { consultation: null, error: err.message }
  }
}

// Get user's consultations
export const getUserConsultations = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()
    
    if (!userProfile) throw new Error('User profile not found')
    
    const { data: consultations, error } = await supabase
      .from('consultation_requests')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return { consultations: consultations || [], error: null }
  } catch (err: any) {
    console.error('Error fetching consultations:', err)
    return { consultations: [], error: err.message }
  }
}

// Update consultation status
export const updateConsultationStatus = async (consultationId: string, status: ConsultationRequest['status']) => {
  try {
    const { data, error } = await supabase
      .from('consultation_requests')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', consultationId)
      .select()
      .single()
    
    if (error) throw error
    
    return { consultation: data, error: null }
  } catch (err: any) {
    console.error('Error updating consultation status:', err)
    return { consultation: null, error: err.message }
  }
}

// Check if email already has consultation
export const getConsultationByEmail = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('consultation_requests')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    return { consultation: data, error: null }
  } catch (err: any) {
    console.error('Error fetching consultation by email:', err)
    return { consultation: null, error: err.message }
  }
}

// Link anonymous consultations to user when they sign up/login
export const linkAnonymousConsultations = async (userEmail: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!userProfile) throw new Error('User profile not found')

    // Find anonymous consultations with this email
    const { data: anonymousConsultations, error: fetchError } = await supabase
      .from('consultation_requests')
      .select('*')
      .eq('email', userEmail)
      .eq('is_anonymous', true)
      .is('user_id', null)

    if (fetchError) throw fetchError

    if (anonymousConsultations && anonymousConsultations.length > 0) {
      // Link all anonymous consultations to this user
      const { error: updateError } = await supabase
        .from('consultation_requests')
        .update({
          user_id: userProfile.id,
          is_anonymous: false,
          updated_at: new Date().toISOString()
        })
        .eq('email', userEmail)
        .eq('is_anonymous', true)
        .is('user_id', null)

      if (updateError) throw updateError

      return {
        linkedCount: anonymousConsultations.length,
        consultations: anonymousConsultations,
        error: null
      }
    }

    return { linkedCount: 0, consultations: [], error: null }
  } catch (err: any) {
    console.error('Error linking anonymous consultations:', err)
    return { linkedCount: 0, consultations: [], error: err.message }
  }
}

// Get consultation summary for user dashboard
export const getConsultationSummary = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (!userProfile) throw new Error('User profile not found')

    const { data: consultations, error } = await supabase
      .from('consultation_requests')
      .select('*')
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Calculate summary statistics
    const summary = {
      total: consultations?.length || 0,
      new: consultations?.filter(c => c.status === 'new').length || 0,
      contacted: consultations?.filter(c => c.status === 'contacted').length || 0,
      quote_requested: consultations?.filter(c => c.status === 'quote_requested').length || 0,
      quoted: consultations?.filter(c => c.status === 'quoted').length || 0,
      recent: consultations?.slice(0, 3) || []
    }

    return { summary, consultations: consultations || [], error: null }
  } catch (err: any) {
    console.error('Error fetching consultation summary:', err)
    return { summary: null, consultations: [], error: err.message }
  }
}
