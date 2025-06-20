import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Video, CheckCircle, ArrowRight, User } from 'lucide-react'
import { Quote } from '@/lib/quoteService'
import { scheduleConsultation } from '@/lib/quoteService'
import { toast } from '@/hooks/use-toast'
import { format, addDays, startOfDay, addHours, isBefore } from 'date-fns'

interface ConsultationSchedulerProps {
  isOpen: boolean
  onClose: () => void
  quote: Quote | null
  onScheduled: () => void
}

interface TimeSlot {
  time: string
  available: boolean
  datetime: Date
}

const generateTimeSlots = (date: Date): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const startHour = 9 // 9 AM
  const endHour = 17 // 5 PM
  const now = new Date()

  for (let hour = startHour; hour < endHour; hour++) {
    const slotTime = new Date(date)
    slotTime.setHours(hour, 0, 0, 0)
    
    // Don't show past time slots
    const available = !isBefore(slotTime, now)
    
    slots.push({
      time: format(slotTime, 'h:mm a'),
      available,
      datetime: slotTime
    })
  }
  
  return slots
}

const generateAvailableDates = () => {
  const dates = []
  const today = new Date()
  
  // Generate next 14 days (excluding weekends for business hours)
  for (let i = 1; i <= 21; i++) {
    const date = addDays(today, i)
    const dayOfWeek = date.getDay()
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(date)
    }
    
    if (dates.length >= 10) break // Limit to 10 available dates
  }
  
  return dates
}

export const ConsultationScheduler: React.FC<ConsultationSchedulerProps> = ({
  isOpen,
  onClose,
  quote,
  onScheduled
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const availableDates = generateAvailableDates()
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : []

  const handleSchedule = async () => {
    if (!quote || !selectedDate || !selectedTime) return

    setIsLoading(true)
    try {
      const { consultation, error } = await scheduleConsultation(
        quote.id,
        selectedTime.datetime.toISOString(),
        30 // 30 minutes
      )

      if (error) {
        toast({
          title: "Error scheduling consultation",
          description: error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Consultation scheduled successfully!",
          description: `We'll send you a calendar invite and meeting link shortly.`,
        })
        onScheduled()
        handleClose()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedDate(null)
    setSelectedTime(null)
    onClose()
  }

  if (!quote) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-montserrat font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Schedule Consultation
          </DialogTitle>
          <p className="text-gray-400 font-opensans">
            Book a 30-minute call to discuss your project: <span className="text-white font-medium">{quote.title}</span>
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quote Summary */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="text-white font-semibold">{quote.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {quote.projectType} • {quote.complexity} • ${quote.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge className="bg-primary text-white">
                  Free Consultation
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* What to Expect */}
          <Card className="bg-gray-800/50 border-gray-600">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                What to Expect
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Project Discussion</p>
                      <p className="text-gray-400 text-sm">Review your requirements and vision</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Creative Direction</p>
                      <p className="text-gray-400 text-sm">Discuss style, tone, and approach</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Timeline & Process</p>
                      <p className="text-gray-400 text-sm">Clarify delivery schedule and workflow</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Final Quote</p>
                      <p className="text-gray-400 text-sm">Receive detailed pricing breakdown</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Select Date
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {availableDates.map((date, index) => {
                const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                return (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      isSelected
                        ? 'ring-2 ring-primary bg-primary/10 border-primary'
                        : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <CardContent className="p-4 text-center">
                      <p className={`text-sm font-medium ${
                        isSelected ? 'text-primary' : 'text-gray-400'
                      }`}>
                        {format(date, 'EEE')}
                      </p>
                      <p className={`text-lg font-bold ${
                        isSelected ? 'text-white' : 'text-white'
                      }`}>
                        {format(date, 'd')}
                      </p>
                      <p className={`text-xs ${
                        isSelected ? 'text-primary' : 'text-gray-400'
                      }`}>
                        {format(date, 'MMM')}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Select Time ({format(selectedDate, 'EEEE, MMMM d')})
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlots.map((slot, index) => {
                  const isSelected = selectedTime?.time === slot.time
                  return (
                    <Button
                      key={index}
                      variant={isSelected ? "default" : "outline"}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot)}
                      className={`${
                        isSelected
                          ? 'bg-gradient-to-r from-primary to-accent text-white'
                          : slot.available
                          ? 'border-gray-600 text-gray-300 hover:text-white hover:border-gray-500'
                          : 'border-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {slot.time}
                    </Button>
                  )
                })}
              </div>
              <p className="text-gray-400 text-sm mt-2">
                All times are in your local timezone. Each consultation is 30 minutes.
              </p>
            </div>
          )}

          {/* Confirmation */}
          {selectedDate && selectedTime && (
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="text-white font-semibold">Consultation Details</p>
                      <p className="text-gray-300 text-sm">
                        {format(selectedDate, 'EEEE, MMMM d')} at {selectedTime.time} (30 minutes)
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Ready to Book
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

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
              onClick={handleSchedule}
              disabled={!selectedDate || !selectedTime || isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-opensans font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Schedule Consultation
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
