import { supabase } from './supabase'
import { Payment } from './quoteService'

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  clientSecret?: string
}

export interface CreatePaymentData {
  quoteId: string
  amount: number
  paymentType: 'deposit' | 'final'
  paymentMethod: 'stripe' | 'paypal'
}

export const createPayment = async (paymentData: CreatePaymentData) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([
        {
          quote_id: paymentData.quoteId,
          amount: paymentData.amount,
          payment_type: paymentData.paymentType,
          payment_method: paymentData.paymentMethod,
          status: 'pending'
        }
      ])
      .select()
      .single()

    if (error) throw error
    return { payment: data, error: null }
  } catch (err: any) {
    console.error('Error creating payment:', err)
    return { payment: null, error: err.message }
  }
}

export const updatePaymentStatus = async (
  paymentId: string, 
  status: Payment['status'],
  stripePaymentId?: string
) => {
  try {
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    }
    
    if (stripePaymentId) {
      updateData.stripe_payment_id = stripePaymentId
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single()

    if (error) throw error
    return { payment: data, error: null }
  } catch (err: any) {
    console.error('Error updating payment status:', err)
    return { payment: null, error: err.message }
  }
}

export const getQuotePayments = async (quoteId: string) => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('quote_id', quoteId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { payments: data || [], error: null }
  } catch (err: any) {
    console.error('Error fetching payments:', err)
    return { payments: [], error: err.message }
  }
}

// Stripe integration (mock for now - you'll need to implement actual Stripe)
export const createStripePaymentIntent = async (
  amount: number,
  currency: string = 'usd'
): Promise<{ paymentIntent: PaymentIntent | null, error: string | null }> => {
  try {
    // This would be a call to your backend API that creates a Stripe PaymentIntent
    // For now, returning a mock response
    const mockPaymentIntent: PaymentIntent = {
      id: `pi_mock_${Date.now()}`,
      amount: amount * 100, // Stripe uses cents
      currency,
      status: 'requires_payment_method',
      clientSecret: `pi_mock_${Date.now()}_secret_mock`
    }

    return { paymentIntent: mockPaymentIntent, error: null }
  } catch (err: any) {
    console.error('Error creating Stripe payment intent:', err)
    return { paymentIntent: null, error: err.message }
  }
}

export const confirmStripePayment = async (
  paymentIntentId: string,
  paymentMethodId: string
): Promise<{ success: boolean, error: string | null }> => {
  try {
    // This would be a call to your backend API that confirms the Stripe payment
    // For now, returning a mock success response
    console.log('Confirming payment:', { paymentIntentId, paymentMethodId })
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return { success: true, error: null }
  } catch (err: any) {
    console.error('Error confirming Stripe payment:', err)
    return { success: false, error: err.message }
  }
}

export const calculatePaymentAmounts = (totalPrice: number) => {
  const depositAmount = Math.round(totalPrice * 0.5 * 100) / 100 // 50% deposit
  const finalAmount = Math.round((totalPrice - depositAmount) * 100) / 100
  
  return {
    depositAmount,
    finalAmount,
    totalAmount: totalPrice
  }
}

export const getPaymentStatus = (payments: Payment[]) => {
  const depositPayment = payments.find(p => p.paymentType === 'deposit')
  const finalPayment = payments.find(p => p.paymentType === 'final')
  
  if (!depositPayment) {
    return 'no_payment'
  }
  
  if (depositPayment.status === 'completed' && !finalPayment) {
    return 'deposit_paid'
  }
  
  if (depositPayment.status === 'completed' && finalPayment?.status === 'completed') {
    return 'fully_paid'
  }
  
  if (depositPayment.status === 'pending') {
    return 'deposit_pending'
  }
  
  if (finalPayment?.status === 'pending') {
    return 'final_pending'
  }
  
  return 'unknown'
}

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export const generateInvoiceNumber = (quoteId: string) => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const shortQuoteId = quoteId.slice(-6).toUpperCase()
  
  return `INV-${year}${month}-${shortQuoteId}`
}
