import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  Lock,
  DollarSign,
  Calendar,
  Info
} from 'lucide-react'
import { Quote } from '@/lib/quoteService'
import { 
  createPayment, 
  calculatePaymentAmounts, 
  formatCurrency,
  createStripePaymentIntent,
  confirmStripePayment
} from '@/lib/paymentService'
import { toast } from '@/hooks/use-toast'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  quote: Quote | null
  paymentType: 'deposit' | 'final'
  onPaymentComplete: () => void
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  quote,
  paymentType,
  onPaymentComplete
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details')

  if (!quote) return null

  const paymentAmounts = calculatePaymentAmounts(quote.totalPrice)
  const amount = paymentType === 'deposit' ? paymentAmounts.depositAmount : paymentAmounts.finalAmount

  const handlePayment = async () => {
    setIsLoading(true)
    setStep('processing')

    try {
      // Create payment record
      const { payment, error: paymentError } = await createPayment({
        quoteId: quote.id,
        amount,
        paymentType,
        paymentMethod
      })

      if (paymentError || !payment) {
        throw new Error(paymentError || 'Failed to create payment')
      }

      // Create Stripe payment intent
      const { paymentIntent, error: stripeError } = await createStripePaymentIntent(amount)
      
      if (stripeError || !paymentIntent) {
        throw new Error(stripeError || 'Failed to create payment intent')
      }

      // Simulate payment confirmation (in real app, this would be handled by Stripe Elements)
      const { success, error: confirmError } = await confirmStripePayment(
        paymentIntent.id,
        'pm_mock_payment_method'
      )

      if (!success) {
        throw new Error(confirmError || 'Payment failed')
      }

      setStep('success')
      toast({
        title: "Payment successful!",
        description: `Your ${paymentType} payment of ${formatCurrency(amount)} has been processed.`,
      })

      // Delay to show success state
      setTimeout(() => {
        onPaymentComplete()
        handleClose()
      }, 2000)

    } catch (error: any) {
      console.error('Payment error:', error)
      toast({
        title: "Payment failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      })
      setStep('details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (step !== 'processing') {
      setStep('details')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-montserrat font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            {paymentType === 'deposit' ? 'Deposit Payment' : 'Final Payment'}
          </DialogTitle>
          <p className="text-gray-400 font-opensans">
            Secure payment for: <span className="text-white font-medium">{quote.title}</span>
          </p>
        </DialogHeader>

        {step === 'details' && (
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-lg">Payment Summary</h3>
                  <Badge className="bg-primary text-white">
                    {paymentType === 'deposit' ? '50% Deposit' : 'Final Payment'}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Project Total:</span>
                    <span className="text-white font-medium">{formatCurrency(quote.totalPrice)}</span>
                  </div>
                  {paymentType === 'deposit' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Deposit (50%):</span>
                        <span className="text-white font-medium">{formatCurrency(paymentAmounts.depositAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Remaining:</span>
                        <span className="text-gray-400">{formatCurrency(paymentAmounts.finalAmount)}</span>
                      </div>
                    </>
                  )}
                  <Separator className="bg-gray-600" />
                  <div className="flex justify-between text-lg">
                    <span className="text-white font-semibold">Amount Due:</span>
                    <span className="text-white font-bold">{formatCurrency(amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <div>
              <h3 className="text-white font-semibold mb-4">Payment Method</h3>
              <div className="grid gap-3">
                <Card
                  className={`cursor-pointer transition-all duration-300 ${
                    paymentMethod === 'stripe'
                      ? 'ring-2 ring-primary bg-primary/10 border-primary'
                      : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setPaymentMethod('stripe')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className={`w-6 h-6 ${
                          paymentMethod === 'stripe' ? 'text-primary' : 'text-gray-400'
                        }`} />
                        <div>
                          <p className="text-white font-medium">Credit/Debit Card</p>
                          <p className="text-gray-400 text-sm">Visa, Mastercard, American Express</p>
                        </div>
                      </div>
                      {paymentMethod === 'stripe' && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all duration-300 opacity-50 cursor-not-allowed ${
                    paymentMethod === 'paypal'
                      ? 'ring-2 ring-primary bg-primary/10 border-primary'
                      : 'bg-gray-800/50 border-gray-600'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">P</span>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">PayPal</p>
                          <p className="text-gray-500 text-sm">Coming soon</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Security Information */}
            <Card className="bg-gray-800/50 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium mb-1">Secure Payment</p>
                    <p className="text-gray-400 text-sm">
                      Your payment information is encrypted and secure. We use industry-standard SSL encryption 
                      and never store your card details.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium mb-2">Payment Terms</p>
                    <ul className="text-gray-300 text-sm space-y-1">
                      {paymentType === 'deposit' ? (
                        <>
                          <li>• 50% deposit required to start production</li>
                          <li>• Remaining 50% due upon project completion</li>
                          <li>• Production begins within 24 hours of deposit</li>
                        </>
                      ) : (
                        <>
                          <li>• Final payment releases completed video files</li>
                          <li>• Full usage rights transferred upon payment</li>
                          <li>• 30-day satisfaction guarantee</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-gray-600 text-gray-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-opensans font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <Lock className="w-4 h-4 mr-2" />
                Pay {formatCurrency(amount)}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6" />
            <h3 className="text-white font-semibold text-lg mb-2">Processing Payment</h3>
            <p className="text-gray-400">Please wait while we process your payment securely...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Payment Successful!</h3>
            <p className="text-gray-400 mb-4">
              Your {paymentType} payment of {formatCurrency(amount)} has been processed.
            </p>
            {paymentType === 'deposit' && (
              <p className="text-green-400 text-sm">
                Production will begin within 24 hours. We'll keep you updated on progress.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
