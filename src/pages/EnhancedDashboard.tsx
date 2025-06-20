import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Video, 
  Plus, 
  Clock, 
  DollarSign, 
  MessageSquare,
  CreditCard,
  FileText,
  CheckCircle,
  Calendar,
  Users,
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserProjects, getProjectStats, type Project, type ProjectStats } from '@/lib/projectService'
import { getUserQuotes, type Quote } from '@/lib/quoteService'
import Navigation from '@/components/Navigation'
import { QuoteRequestModal } from '@/components/dashboard/QuoteRequestModal'
import { QuoteCard } from '@/components/dashboard/QuoteCard'
import { ConsultationScheduler } from '@/components/dashboard/ConsultationScheduler'
import { PaymentModal } from '@/components/dashboard/PaymentModal'
import { ProjectCard } from '@/components/dashboard/ProjectCard'
import { StatsCard } from '@/components/dashboard/StatsCard'
import ConsultationHistory from '@/components/dashboard/ConsultationHistory'
import { toast } from '@/hooks/use-toast'

const EnhancedDashboard = () => {
  const { user } = useAuth()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [quoteRequestOpen, setQuoteRequestOpen] = useState(false)
  const [consultationOpen, setConsultationOpen] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [paymentType, setPaymentType] = useState<'deposit' | 'final'>('deposit')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access the dashboard",
          variant: "destructive",
        })
        return
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 5000)
      })

      try {
        const [quotesResult, projectsResult, statsResult] = await Promise.race([
          Promise.all([
            getUserQuotes(),
            getUserProjects(undefined, user.id),
            getProjectStats(user.id)
          ]),
          timeoutPromise
        ]) as [any, any, any]

        // Handle quotes
        if (quotesResult && !quotesResult.error) {
          setQuotes(quotesResult.quotes)
        } else {
          setQuotes([])
        }

        // Handle projects
        if (projectsResult && !projectsResult.error) {
          setProjects(projectsResult.projects)
        } else {
          setProjects([])
        }

        // Handle stats
        if (statsResult && !statsResult.error && statsResult.stats) {
          setStats(statsResult.stats)
        } else {
          setStats({
            totalProjects: 0,
            completedProjects: 0,
            processingProjects: 0,
            draftProjects: 0,
            totalDuration: 0,
            creditsUsed: 0,
            creditsLimit: 100
          })
        }
      } catch (timeoutError) {
        // Silently fall back to default values
        setQuotes([])
        setProjects([])
        setStats({
          totalProjects: 0,
          completedProjects: 0,
          processingProjects: 0,
          draftProjects: 0,
          totalDuration: 0,
          creditsUsed: 0,
          creditsLimit: 100
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuoteCreated = () => {
    fetchDashboardData()
  }

  const handleViewQuoteDetails = (quote: Quote) => {
    // TODO: Implement quote details modal
    toast({
      title: "Quote Details",
      description: `Viewing details for: ${quote.title}`,
    })
  }

  const handleScheduleConsultation = (quote: Quote) => {
    setSelectedQuote(quote)
    setConsultationOpen(true)
  }

  const handleMakePayment = (quote: Quote) => {
    setSelectedQuote(quote)
    setPaymentType('deposit') // Default to deposit
    setPaymentOpen(true)
  }

  const handleConsultationScheduled = () => {
    fetchDashboardData()
  }

  const handlePaymentComplete = () => {
    fetchDashboardData()
  }

  // Calculate dashboard metrics
  const pendingQuotes = quotes.filter(q => q.status === 'pending').length
  const activeQuotes = quotes.filter(q => ['consultation_scheduled', 'quoted', 'approved'].includes(q.status)).length
  const totalQuoteValue = quotes.reduce((sum, q) => sum + q.totalPrice, 0)

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-montserrat font-bold text-3xl text-white mb-2">
                  Welcome back, {user?.user_metadata?.name || 'Creator'}!
                </h1>
                <p className="font-opensans text-gray-400">
                  Ready to create your next AI-powered video? Start with a free consultation.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="border-gray-600 text-gray-300 hover:text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => setQuoteRequestOpen(true)}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-opensans font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Request Quote
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Active Quotes"
              value={activeQuotes}
              change={`${pendingQuotes} pending review`}
              changeType="neutral"
              icon={FileText}
              color="text-primary"
              loading={loading}
            />
            <StatsCard
              title="Total Quote Value"
              value={`$${totalQuoteValue.toLocaleString()}`}
              change="across all quotes"
              changeType="positive"
              icon={DollarSign}
              color="text-green-400"
              loading={loading}
            />
            <StatsCard
              title="Videos Created"
              value={stats?.totalProjects || 0}
              change={`${stats?.completedProjects || 0} completed`}
              changeType="positive"
              icon={Video}
              color="text-accent"
              loading={loading}
            />
            <StatsCard
              title="Credits Used"
              value={`${stats?.creditsUsed || 0}/${stats?.creditsLimit || 100}`}
              change={`${(stats?.creditsLimit || 100) - (stats?.creditsUsed || 0)} remaining`}
              changeType={((stats?.creditsUsed || 0) / (stats?.creditsLimit || 100)) > 0.8 ? 'negative' : 'positive'}
              icon={Clock}
              color="text-yellow-400"
              loading={loading}
            />
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="consultations" className="space-y-6">
            <TabsList className="bg-gray-800/50 border border-gray-700">
              <TabsTrigger value="consultations" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Consultations
              </TabsTrigger>
              <TabsTrigger value="quotes" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <FileText className="w-4 h-4 mr-2" />
                Quotes ({quotes.length})
              </TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                <Video className="w-4 h-4 mr-2" />
                Projects ({projects.length})
              </TabsTrigger>
            </TabsList>

            {/* Consultations Tab */}
            <TabsContent value="consultations">
              <ConsultationHistory onRequestQuote={() => setQuoteRequestOpen(true)} />
            </TabsContent>

            {/* Quotes Tab */}
            <TabsContent value="quotes">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="font-montserrat font-bold text-xl text-white">
                    Your Quotes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="grid gap-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-700/30 rounded-xl p-6 animate-pulse">
                          <div className="h-6 bg-gray-600 rounded mb-4 w-1/3"></div>
                          <div className="h-4 bg-gray-600 rounded mb-2"></div>
                          <div className="h-4 bg-gray-600 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : quotes.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <h3 className="font-montserrat font-semibold text-white mb-2">No quotes yet</h3>
                      <p className="text-gray-400 mb-6">
                        Start by requesting a free consultation to discuss your video project!
                      </p>
                      <Button
                        onClick={() => setQuoteRequestOpen(true)}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Request Your First Quote
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {quotes.map((quote) => (
                        <QuoteCard
                          key={quote.id}
                          quote={quote}
                          onViewDetails={handleViewQuoteDetails}
                          onScheduleConsultation={handleScheduleConsultation}
                          onMakePayment={handleMakePayment}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="font-montserrat font-bold text-xl text-white">
                    Your Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-700/30 rounded-xl p-6 animate-pulse">
                          <div className="aspect-video bg-gray-600 rounded-lg mb-4"></div>
                          <div className="h-4 bg-gray-600 rounded mb-2"></div>
                          <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-12">
                      <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <h3 className="font-montserrat font-semibold text-white mb-2">No projects yet</h3>
                      <p className="text-gray-400 mb-6">
                        Projects will appear here once you approve a quote and make a deposit payment.
                      </p>
                      <Button
                        onClick={() => setQuoteRequestOpen(true)}
                        className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Start with a Quote
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {projects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onView={() => {}}
                          onEdit={() => {}}
                          onDelete={() => {}}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <QuoteRequestModal
        isOpen={quoteRequestOpen}
        onClose={() => setQuoteRequestOpen(false)}
        onQuoteCreated={handleQuoteCreated}
      />

      <ConsultationScheduler
        isOpen={consultationOpen}
        onClose={() => setConsultationOpen(false)}
        quote={selectedQuote}
        onScheduled={handleConsultationScheduled}
      />

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        quote={selectedQuote}
        paymentType={paymentType}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  )
}

export default EnhancedDashboard
