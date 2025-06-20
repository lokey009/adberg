import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  Eye,
  Calendar,
  User,
  Building
} from 'lucide-react'
import { getConsultationSummary } from '@/lib/consultationService'
import { format } from 'date-fns'

interface ConsultationHistoryProps {
  onRequestQuote?: () => void
}

const ConsultationHistory: React.FC<ConsultationHistoryProps> = ({ onRequestQuote }) => {
  const [summary, setSummary] = useState<any>(null)
  const [consultations, setConsultations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadConsultations()
  }, [])

  const loadConsultations = async () => {
    setIsLoading(true)
    try {
      const { summary: summaryData, consultations: consultationData, error } = await getConsultationSummary()
      if (!error) {
        setSummary(summaryData)
        setConsultations(consultationData)
      }
    } catch (err) {
      console.error('Error loading consultations:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'contacted':
        return <MessageCircle className="w-4 h-4 text-yellow-500" />
      case 'quote_requested':
        return <Eye className="w-4 h-4 text-purple-500" />
      case 'quoted':
        return <DollarSign className="w-4 h-4 text-green-500" />
      case 'converted':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800'
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800'
      case 'quote_requested':
        return 'bg-purple-100 text-purple-800'
      case 'quoted':
        return 'bg-green-100 text-green-800'
      case 'converted':
        return 'bg-green-200 text-green-900'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Consultation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Consultations</p>
                  <p className="text-2xl font-bold">{summary.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{summary.new + summary.contacted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Quote Requested</p>
                  <p className="text-2xl font-bold">{summary.quote_requested}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Quoted</p>
                  <p className="text-2xl font-bold">{summary.quoted}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Consultation List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Your Consultations
          </CardTitle>
          {onRequestQuote && (
            <Button onClick={onRequestQuote} className="bg-gradient-to-r from-primary to-accent">
              Request New Quote
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {consultations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No consultations yet</h3>
              <p className="text-gray-500 mb-4">Start by requesting a quote for your project</p>
              {onRequestQuote && (
                <Button onClick={onRequestQuote} className="bg-gradient-to-r from-primary to-accent">
                  Request Your First Quote
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(consultation.status)}
                      <div>
                        <h4 className="font-semibold">
                          {consultation.title || consultation.project_type || 'Consultation Request'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {format(new Date(consultation.created_at), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(consultation.status)}>
                      {formatStatus(consultation.status)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    {consultation.company && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building className="w-4 h-4" />
                        {consultation.company}
                      </div>
                    )}
                    {consultation.project_type && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        {consultation.project_type}
                      </div>
                    )}
                    {consultation.budget && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        Budget: {consultation.budget}
                      </div>
                    )}
                    {consultation.timeline && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Timeline: {consultation.timeline}
                      </div>
                    )}
                  </div>
                  
                  {consultation.description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {consultation.description}
                    </p>
                  )}
                  
                  {consultation.total_price && (
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-sm text-gray-600">Quote Total:</span>
                      <span className="font-semibold text-green-600">
                        ${consultation.total_price}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ConsultationHistory
