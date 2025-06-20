import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  Video,
  MessageSquare,
  CreditCard,
  ArrowRight,
  Eye,
  Download
} from 'lucide-react'
import { Quote } from '@/lib/quoteService'
import { formatDistanceToNow } from 'date-fns'
import { formatCurrency } from '@/lib/paymentService'

interface QuoteCardProps {
  quote: Quote & {
    consultations?: any[]
    payments?: any[]
    projects?: any[]
  }
  onViewDetails: (quote: Quote) => void
  onScheduleConsultation: (quote: Quote) => void
  onMakePayment: (quote: Quote) => void
}

const getStatusConfig = (status: Quote['status']) => {
  switch (status) {
    case 'pending':
      return {
        label: 'Under Review',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: Clock,
        description: 'We\'re reviewing your requirements'
      }
    case 'consultation_scheduled':
      return {
        label: 'Consultation Scheduled',
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: Calendar,
        description: 'Meeting scheduled to discuss details'
      }
    case 'quoted':
      return {
        label: 'Quote Ready',
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: CheckCircle,
        description: 'Your custom quote is ready for review'
      }
    case 'approved':
      return {
        label: 'Approved',
        color: 'bg-primary/20 text-primary border-primary/30',
        icon: CheckCircle,
        description: 'Quote approved, awaiting payment'
      }
    case 'rejected':
      return {
        label: 'Declined',
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: XCircle,
        description: 'Quote was declined'
      }
    case 'expired':
      return {
        label: 'Expired',
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        icon: AlertCircle,
        description: 'Quote has expired'
      }
    default:
      return {
        label: 'Unknown',
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        icon: AlertCircle,
        description: 'Status unknown'
      }
  }
}

const getProjectTypeLabel = (type: string) => {
  switch (type) {
    case 'short': return 'Short-Form Ad'
    case 'long': return 'Long-Form Ad'
    case 'custom': return 'Custom Project'
    default: return type
  }
}

const getComplexityLabel = (complexity: string) => {
  switch (complexity) {
    case 'basic': return 'Basic'
    case 'standard': return 'Standard'
    case 'premium': return 'Premium'
    default: return complexity
  }
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  onViewDetails,
  onScheduleConsultation,
  onMakePayment
}) => {
  const statusConfig = getStatusConfig(quote.status)
  const StatusIcon = statusConfig.icon
  
  const isExpired = new Date(quote.validUntil) < new Date()
  const daysUntilExpiry = Math.ceil(
    (new Date(quote.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  const hasConsultation = quote.consultations && quote.consultations.length > 0
  const hasPayments = quote.payments && quote.payments.length > 0
  const hasProjects = quote.projects && quote.projects.length > 0

  const getNextAction = () => {
    if (quote.status === 'pending') {
      return {
        label: 'Under Review',
        action: null,
        description: 'We\'ll contact you within 24 hours'
      }
    }
    
    if (quote.status === 'quoted' && !hasPayments) {
      return {
        label: 'Make Payment',
        action: () => onMakePayment(quote),
        description: 'Pay 50% deposit to start production',
        primary: true
      }
    }
    
    if (quote.status === 'consultation_scheduled' || (quote.status === 'quoted' && !hasConsultation)) {
      return {
        label: 'Schedule Consultation',
        action: () => onScheduleConsultation(quote),
        description: 'Book a call to discuss your project',
        primary: true
      }
    }

    if (hasProjects) {
      return {
        label: 'View Project',
        action: () => onViewDetails(quote),
        description: 'Check your project progress'
      }
    }

    return {
      label: 'View Details',
      action: () => onViewDetails(quote),
      description: 'See full quote details'
    }
  }

  const nextAction = getNextAction()

  return (
    <Card className="bg-gray-800/50 border-gray-600 hover:border-gray-500 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white font-montserrat text-lg mb-2">
              {quote.title}
            </CardTitle>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className="text-xs">
                {getProjectTypeLabel(quote.projectType)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getComplexityLabel(quote.complexity)}
              </Badge>
              {quote.urgency === 'rush' && (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                  Rush
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-montserrat font-bold text-white">
              {formatCurrency(quote.totalPrice)}
            </p>
            <p className="text-sm text-gray-400">Total Price</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${statusConfig.color.split(' ')[1]}`} />
          <Badge className={`${statusConfig.color} text-xs`}>
            {statusConfig.label}
          </Badge>
          <span className="text-gray-400 text-sm">•</span>
          <span className="text-gray-400 text-sm">
            {formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm line-clamp-2">
          {quote.description}
        </p>

        <Separator className="bg-gray-700" />

        {/* Quote Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Timeline:</span>
            <span className="text-white">{quote.timeline || 'TBD'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400">Valid until:</span>
            <span className={`${isExpired ? 'text-red-400' : 'text-white'}`}>
              {isExpired ? 'Expired' : `${daysUntilExpiry} days`}
            </span>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center gap-4 text-xs">
          <div className={`flex items-center gap-1 ${hasConsultation ? 'text-green-400' : 'text-gray-500'}`}>
            <MessageSquare className="w-3 h-3" />
            <span>Consultation</span>
            {hasConsultation && <CheckCircle className="w-3 h-3" />}
          </div>
          <div className={`flex items-center gap-1 ${hasPayments ? 'text-green-400' : 'text-gray-500'}`}>
            <CreditCard className="w-3 h-3" />
            <span>Payment</span>
            {hasPayments && <CheckCircle className="w-3 h-3" />}
          </div>
          <div className={`flex items-center gap-1 ${hasProjects ? 'text-green-400' : 'text-gray-500'}`}>
            <Video className="w-3 h-3" />
            <span>Production</span>
            {hasProjects && <CheckCircle className="w-3 h-3" />}
          </div>
        </div>

        <Separator className="bg-gray-700" />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onViewDetails(quote)}
            className="flex-1 border-gray-600 text-gray-300 hover:text-white hover:border-gray-500"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          
          {nextAction.action && (
            <Button
              onClick={nextAction.action}
              className={`flex-1 ${
                nextAction.primary
                  ? 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90'
                  : 'bg-gray-700 hover:bg-gray-600'
              } text-white`}
            >
              {nextAction.label}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Next Action Description */}
        {nextAction.description && (
          <p className="text-gray-400 text-xs text-center">
            {nextAction.description}
          </p>
        )}

        {/* Expiry Warning */}
        {!isExpired && daysUntilExpiry <= 3 && quote.status === 'quoted' && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-medium">
                Quote expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
