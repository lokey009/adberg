import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Video, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  CheckCircle, 
  Zap,
  Star,
  Shield,
  Users
} from 'lucide-react'
import { createQuote, CreateQuoteData, calculateQuotePrice } from '@/lib/quoteService'
import { getUserConsultations, convertToQuote } from '@/lib/consultationService'
import { toast } from '@/hooks/use-toast'

const quoteSchema = z.object({
  projectType: z.enum(['short', 'long', 'custom'], {
    required_error: 'Please select a project type'
  }),
  complexity: z.enum(['basic', 'standard', 'premium'], {
    required_error: 'Please select a complexity level'
  }),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Please provide a detailed description (min 10 characters)'),
  targetAudience: z.string().min(3, 'Please describe your target audience'),
  brandGuidelines: z.string().optional(),
  urgency: z.enum(['standard', 'rush']).default('standard'),
  additionalRequirements: z.string().optional(),
})

type QuoteFormData = z.infer<typeof quoteSchema>

interface QuoteRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onQuoteCreated: () => void
}

const projectTypes = [
  {
    id: 'short',
    name: 'Short-Form Ad',
    description: '15-30 seconds, perfect for social media',
    duration: '15-30 sec',
    icon: Video,
    popular: true
  },
  {
    id: 'long',
    name: 'Long-Form Ad',
    description: '60-90 seconds, ideal for detailed storytelling',
    duration: '60-90 sec',
    icon: Clock,
    popular: false
  },
  {
    id: 'custom',
    name: 'Custom Project',
    description: 'Tailored to your specific requirements',
    duration: 'Variable',
    icon: Star,
    popular: false
  }
]

const complexityLevels = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Template-based with stock assets',
    features: ['Template approach', 'Stock music & voices', '1 revision', '3-5 day delivery'],
    icon: Shield,
    priceRange: '$399-799'
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Semi-custom with AI voice generation',
    features: ['Semi-custom approach', 'AI voice generation', '2-3 revisions', '5-7 day delivery'],
    icon: Users,
    priceRange: '$699-1,399',
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Fully custom with unlimited revisions',
    features: ['Fully custom creation', 'Multiple voice options', 'Unlimited revisions', 'Rush delivery'],
    icon: Star,
    priceRange: '$1,199-2,199'
  }
]

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  isOpen,
  onClose,
  onQuoteCreated
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)
  const [existingConsultation, setExistingConsultation] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      urgency: 'standard'
    }
  })

  const watchedProjectType = watch('projectType')
  const watchedComplexity = watch('complexity')
  const watchedUrgency = watch('urgency')

  // Update estimated price when selections change
  React.useEffect(() => {
    if (watchedProjectType && watchedComplexity) {
      const pricing = calculateQuotePrice(
        watchedProjectType,
        watchedComplexity,
        watchedUrgency || 'standard'
      )
      setEstimatedPrice(pricing.totalPrice)
    }
  }, [watchedProjectType, watchedComplexity, watchedUrgency])

  // Load existing consultation data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadExistingConsultation()
    }
  }, [isOpen])

  const loadExistingConsultation = async () => {
    try {
      const { consultations, error } = await getUserConsultations()
      if (!error && consultations.length > 0) {
        // Get the most recent consultation that hasn't been converted to a quote
        const pendingConsultation = consultations.find(c =>
          c.status === 'new' || c.status === 'contacted'
        )

        if (pendingConsultation) {
          setExistingConsultation(pendingConsultation)

          // Pre-populate form with existing data
          if (pendingConsultation.target_audience) {
            setValue('targetAudience', pendingConsultation.target_audience)
          }
          if (pendingConsultation.message) {
            setValue('description', pendingConsultation.message)
          }
          // Map project type if it matches our enum
          if (['short', 'long', 'custom'].includes(pendingConsultation.project_type)) {
            setValue('projectType', pendingConsultation.project_type as any)
          }
        }
      }
    } catch (err) {
      console.error('Error loading consultation data:', err)
    }
  }

  const onSubmit = async (data: QuoteFormData) => {
    setIsLoading(true)
    try {
      let result;

      if (existingConsultation) {
        // Update existing consultation with enhanced quote data
        result = await convertToQuote(existingConsultation.id, {
          ...data,
          source: 'dashboard'
        })
      } else {
        // Create new consultation with full quote data
        result = await createConsultation({
          name: '', // Will be filled from user profile
          email: '', // Will be filled from user profile
          ...data,
          source: 'dashboard'
        })
      }

      if (result.error) {
        toast({
          title: "Error creating quote request",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Quote request submitted successfully!",
          description: "We'll review your requirements and get back to you within 24 hours.",
        })
        onQuoteCreated()
        handleClose()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setStep(1)
    setEstimatedPrice(null)
    onClose()
  }

  const handleProjectTypeSelect = (typeId: string) => {
    setValue('projectType', typeId as any)
  }

  const handleComplexitySelect = (complexityId: string) => {
    setValue('complexity', complexityId as any)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-montserrat font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            Request Custom Quote
          </DialogTitle>
          <p className="text-gray-400 font-opensans">
            Tell us about your project and we'll provide a detailed quote within 24 hours
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Project Type Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-white font-opensans font-medium text-lg mb-4 block">
                  What type of video ad do you need?
                </Label>
                <div className="grid md:grid-cols-3 gap-4">
                  {projectTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = watchedProjectType === type.id
                    return (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                          isSelected
                            ? 'ring-2 ring-primary bg-primary/10 border-primary'
                            : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => handleProjectTypeSelect(type.id)}
                      >
                        <CardContent className="p-6 text-center">
                          {type.popular && (
                            <Badge className="mb-3 bg-primary text-white">Most Popular</Badge>
                          )}
                          <Icon className={`w-12 h-12 mx-auto mb-4 ${
                            isSelected ? 'text-primary' : 'text-gray-400'
                          }`} />
                          <h3 className="font-montserrat font-semibold text-white mb-2">
                            {type.name}
                          </h3>
                          <p className="text-gray-400 text-sm mb-3">{type.description}</p>
                          <Badge variant="outline" className="text-xs">
                            {type.duration}
                          </Badge>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
                {errors.projectType && (
                  <p className="text-red-400 text-sm mt-2">{errors.projectType.message}</p>
                )}
              </div>

              {watchedProjectType && (
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  Continue to Complexity Level
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* Step 2: Complexity Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-white font-opensans font-medium text-lg">
                  Choose your complexity level
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="text-gray-400 border-gray-600"
                >
                  Back
                </Button>
              </div>
              
              <div className="grid gap-4">
                {complexityLevels.map((level) => {
                  const Icon = level.icon
                  const isSelected = watchedComplexity === level.id
                  return (
                    <Card
                      key={level.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'ring-2 ring-primary bg-primary/10 border-primary'
                          : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handleComplexitySelect(level.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <Icon className={`w-8 h-8 mt-1 ${
                              isSelected ? 'text-primary' : 'text-gray-400'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-montserrat font-semibold text-white">
                                  {level.name}
                                </h3>
                                {level.popular && (
                                  <Badge className="bg-primary text-white text-xs">Recommended</Badge>
                                )}
                              </div>
                              <p className="text-gray-400 mb-3">{level.description}</p>
                              <div className="grid grid-cols-2 gap-2">
                                {level.features.map((feature, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-gray-300">{feature}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Starting at</p>
                            <p className="font-montserrat font-bold text-white text-lg">
                              {level.priceRange}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              {errors.complexity && (
                <p className="text-red-400 text-sm mt-2">{errors.complexity.message}</p>
              )}

              {watchedComplexity && (
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  Continue to Project Details
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          {/* Step 3: Project Details */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-white font-opensans font-medium text-lg">
                  Tell us about your project
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="text-gray-400 border-gray-600"
                >
                  Back
                </Button>
              </div>

              {/* Estimated Price Display */}
              {estimatedPrice && (
                <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-6 h-6 text-primary" />
                        <div>
                          <p className="text-white font-semibold">Estimated Price</p>
                          <p className="text-gray-400 text-sm">Based on your selections</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-montserrat font-bold text-white">
                          ${estimatedPrice.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400">Final quote may vary</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-white font-opensans font-medium">
                    Project Title *
                  </Label>
                  <Input
                    className="mt-2 bg-gray-800/50 border-gray-600 text-white"
                    placeholder="e.g., Summer Collection Launch Ad"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-white font-opensans font-medium">
                    Target Audience *
                  </Label>
                  <Input
                    className="mt-2 bg-gray-800/50 border-gray-600 text-white"
                    placeholder="e.g., Women 25-40, fashion-conscious"
                    {...register('targetAudience')}
                  />
                  {errors.targetAudience && (
                    <p className="text-red-400 text-sm mt-1">{errors.targetAudience.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-white font-opensans font-medium">
                  Project Description *
                </Label>
                <Textarea
                  className="mt-2 bg-gray-800/50 border-gray-600 text-white min-h-[120px]"
                  placeholder="Describe your vision, key messages, desired tone, and any specific requirements..."
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <Label className="text-white font-opensans font-medium">
                  Brand Guidelines (Optional)
                </Label>
                <Textarea
                  className="mt-2 bg-gray-800/50 border-gray-600 text-white"
                  placeholder="Share your brand colors, fonts, style preferences, or link to brand guidelines..."
                  {...register('brandGuidelines')}
                />
              </div>

              <div>
                <Label className="text-white font-opensans font-medium">
                  Additional Requirements (Optional)
                </Label>
                <Textarea
                  className="mt-2 bg-gray-800/50 border-gray-600 text-white"
                  placeholder="Any specific requirements, deadlines, or special considerations..."
                  {...register('additionalRequirements')}
                />
              </div>

              {/* Urgency Selection */}
              <div>
                <Label className="text-white font-opensans font-medium mb-3 block">
                  Delivery Timeline
                </Label>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card
                    className={`cursor-pointer transition-all duration-300 ${
                      watchedUrgency === 'standard'
                        ? 'ring-2 ring-primary bg-primary/10 border-primary'
                        : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setValue('urgency', 'standard')}
                  >
                    <CardContent className="p-4 text-center">
                      <Clock className={`w-8 h-8 mx-auto mb-3 ${
                        watchedUrgency === 'standard' ? 'text-primary' : 'text-gray-400'
                      }`} />
                      <h3 className="font-semibold text-white mb-1">Standard</h3>
                      <p className="text-gray-400 text-sm">Regular timeline</p>
                    </CardContent>
                  </Card>
                  
                  <Card
                    className={`cursor-pointer transition-all duration-300 ${
                      watchedUrgency === 'rush'
                        ? 'ring-2 ring-primary bg-primary/10 border-primary'
                        : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setValue('urgency', 'rush')}
                  >
                    <CardContent className="p-4 text-center">
                      <Zap className={`w-8 h-8 mx-auto mb-3 ${
                        watchedUrgency === 'rush' ? 'text-primary' : 'text-gray-400'
                      }`} />
                      <h3 className="font-semibold text-white mb-1">Rush</h3>
                      <p className="text-gray-400 text-sm">50% faster (+50% cost)</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-gray-600 text-gray-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-opensans font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Quote Request
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
