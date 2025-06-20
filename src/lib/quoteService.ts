import { supabase } from './supabase'

export interface Quote {
  id: string
  userId: string
  projectType: 'short' | 'long' | 'custom'
  complexity: 'basic' | 'standard' | 'premium'
  title: string
  description: string
  targetAudience: string
  brandGuidelines?: string
  urgency: 'standard' | 'rush'
  additionalRequirements?: string
  basePrice: number
  addOns?: Array<{name: string, price: number}>
  totalPrice: number
  status: 'pending' | 'consultation_scheduled' | 'quoted' | 'approved' | 'rejected' | 'expired'
  timeline?: string
  validUntil: string
  createdAt: string
  updatedAt: string
}

export interface CreateQuoteData {
  projectType: 'short' | 'long' | 'custom'
  complexity: 'basic' | 'standard' | 'premium'
  title: string
  description: string
  targetAudience: string
  brandGuidelines?: string
  urgency: 'standard' | 'rush'
  additionalRequirements?: string
}

export interface Consultation {
  id: string
  quoteId: string
  scheduledAt: string
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  meetingLink?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  quoteId: string
  amount: number
  paymentType: 'deposit' | 'final'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod?: string
  stripePaymentId?: string
  createdAt: string
  updatedAt: string
}

// Pricing configuration - Updated with 50% discount
const PRICING_CONFIG = {
  short: {
    basic: { basePrice: 199, originalPrice: 399, timeline: '3-5 business days' },
    standard: { basePrice: 349, originalPrice: 699, timeline: '5-7 business days' },
    premium: { basePrice: 599, originalPrice: 1199, timeline: '7-10 business days' }
  },
  long: {
    basic: { basePrice: 399, originalPrice: 799, timeline: '5-7 business days' },
    standard: { basePrice: 699, originalPrice: 1399, timeline: '7-10 business days' },
    premium: { basePrice: 1099, originalPrice: 2199, timeline: '10-14 business days' }
  },
  custom: {
    basic: { basePrice: 749, originalPrice: 1499, timeline: '10-14 business days' },
    standard: { basePrice: 1249, originalPrice: 2499, timeline: '14-21 business days' },
    premium: { basePrice: 1999, originalPrice: 3999, timeline: '21-30 business days' }
  }
}

const ADD_ONS = {
  rush: { name: 'Rush Delivery (50% faster)', multiplier: 1.5 },
  multipleFormats: { name: 'Multiple Formats (Square, Vertical)', price: 299 },
  extraRevisions: { name: 'Extra Revisions (per revision)', price: 199 },
  extendedRights: { name: 'Extended Usage Rights', price: 499 }
}

export const calculateQuotePrice = (
  projectType: 'short' | 'long' | 'custom',
  complexity: 'basic' | 'standard' | 'premium',
  urgency: 'standard' | 'rush',
  addOns: string[] = []
) => {
  const config = PRICING_CONFIG[projectType][complexity]
  let basePrice = config.basePrice
  let timeline = config.timeline
  
  const selectedAddOns: Array<{name: string, price: number}> = []
  let totalPrice = basePrice

  // Apply rush pricing
  if (urgency === 'rush') {
    const rushMultiplier = ADD_ONS.rush.multiplier
    basePrice = Math.round(basePrice * rushMultiplier)
    totalPrice = basePrice
    timeline = timeline.replace(/(\d+)-(\d+)/, (match, start, end) => {
      const newStart = Math.ceil(parseInt(start) / 2)
      const newEnd = Math.ceil(parseInt(end) / 2)
      return `${newStart}-${newEnd}`
    })
    selectedAddOns.push({ name: ADD_ONS.rush.name, price: basePrice - config.basePrice })
  }

  // Apply other add-ons
  addOns.forEach(addOnKey => {
    if (addOnKey in ADD_ONS && addOnKey !== 'rush') {
      const addOn = ADD_ONS[addOnKey as keyof typeof ADD_ONS]
      if ('price' in addOn) {
        selectedAddOns.push({ name: addOn.name, price: addOn.price })
        totalPrice += addOn.price
      }
    }
  })

  return {
    basePrice,
    addOns: selectedAddOns,
    totalPrice,
    timeline
  }
}

export const createQuote = async (quoteData: CreateQuoteData) => {
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

    // Calculate pricing
    const pricing = calculateQuotePrice(
      quoteData.projectType,
      quoteData.complexity,
      quoteData.urgency
    )

    // Set quote validity (7 days from now)
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 7)

    const { data, error } = await supabase
      .from('quotes')
      .insert([
        {
          ...quoteData,
          user_id: userProfile.id,
          base_price: pricing.basePrice,
          add_ons: pricing.addOns,
          total_price: pricing.totalPrice,
          timeline: pricing.timeline,
          valid_until: validUntil.toISOString(),
          status: 'pending'
        }
      ])
      .select()
      .single()

    if (error) throw error
    return { quote: data, error: null }
  } catch (err: any) {
    console.error('Error creating quote:', err)
    return { quote: null, error: err.message }
  }
}

export const getUserQuotes = async () => {
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

    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        consultations(*),
        payments(*),
        projects(*)
      `)
      .eq('user_id', userProfile.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { quotes: data || [], error: null }
  } catch (err: any) {
    console.error('Error fetching quotes:', err)
    return { quotes: [], error: err.message }
  }
}

export const updateQuoteStatus = async (quoteId: string, status: Quote['status']) => {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', quoteId)
      .select()
      .single()

    if (error) throw error
    return { quote: data, error: null }
  } catch (err: any) {
    console.error('Error updating quote status:', err)
    return { quote: null, error: err.message }
  }
}

export const scheduleConsultation = async (
  quoteId: string,
  scheduledAt: string,
  duration: number = 30
) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .insert([
        {
          quote_id: quoteId,
          scheduled_at: scheduledAt,
          duration,
          status: 'scheduled'
        }
      ])
      .select()
      .single()

    if (error) throw error

    // Update quote status
    await updateQuoteStatus(quoteId, 'consultation_scheduled')

    return { consultation: data, error: null }
  } catch (err: any) {
    console.error('Error scheduling consultation:', err)
    return { consultation: null, error: err.message }
  }
}
