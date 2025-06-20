import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Plus, Video, Clock, DollarSign, Users, RefreshCw, Grid, List } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal'
import { ProjectCard } from '@/components/dashboard/ProjectCard'
import { ProjectDetailsModal } from '@/components/dashboard/ProjectDetailsModal'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { getUserProjects, getProjectStats, Project, ProjectStats } from '@/lib/projectService'
import { toast } from '@/hooks/use-toast'

const Dashboard = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

      // Try to fetch data with a shorter timeout, fall back to defaults silently
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 5000)
      })

      try {
        const [projectsResult, statsResult] = await Promise.race([
          Promise.all([
            getUserProjects(undefined, user.id),
            getProjectStats(user.id)
          ]),
          timeoutPromise
        ]) as [any, any]

        // Handle successful results
        if (projectsResult && !projectsResult.error) {
          setProjects(projectsResult.projects)
        } else {
          setProjects([]) // Default to empty array
        }

        if (statsResult && !statsResult.error && statsResult.stats) {
          setStats(statsResult.stats)
        } else {
          // Default stats for new users
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
        // Silently fall back to default values on timeout
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

  const handleProjectCreated = () => {
    fetchDashboardData()
  }

  const handleProjectView = (project: Project) => {
    setSelectedProjectId(project.id)
    setDetailsModalOpen(true)
  }

  const handleProjectEdit = (project: Project) => {
    // TODO: Navigate to project editor
    toast({
      title: "Feature coming soon",
      description: "Project editing will be available soon!",
    })
  }

  const handleProjectDelete = (project: Project) => {
    // TODO: Implement project deletion
    toast({
      title: "Feature coming soon",
      description: "Project deletion will be available soon!",
    })
  }

  const calculateSavings = (completedProjects: number) => {
    // Estimate savings: traditional video production costs ~$2000-5000 per video
    // Our service costs much less, so calculate savings
    const avgTraditionalCost = 3000
    const avgOurCost = 200
    const savings = (avgTraditionalCost - avgOurCost) * completedProjects
    return savings.toLocaleString()
  }

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
                  Ready to create your next AI-powered video?
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
                  onClick={() => setCreateModalOpen(true)}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-opensans font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Video
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Videos Created"
              value={stats?.totalProjects || 0}
              change={`${stats?.completedProjects || 0} completed`}
              changeType="positive"
              icon={Video}
              color="text-primary"
              loading={loading}
            />
            <StatsCard
              title="Credits Used"
              value={`${stats?.creditsUsed || 0}/${stats?.creditsLimit || 100}`}
              change={`${(stats?.creditsLimit || 100) - (stats?.creditsUsed || 0)} remaining`}
              changeType={((stats?.creditsUsed || 0) / (stats?.creditsLimit || 100)) > 0.8 ? 'negative' : 'positive'}
              icon={Clock}
              color="text-accent"
              loading={loading}
            />
            <StatsCard
              title="Total Savings"
              value={`$${calculateSavings(stats?.completedProjects || 0)}`}
              change="vs traditional"
              changeType="positive"
              icon={DollarSign}
              color="text-green-400"
              loading={loading}
            />
            <StatsCard
              title="Processing"
              value={stats?.processingProjects || 0}
              change={`${stats?.draftProjects || 0} drafts`}
              changeType="neutral"
              icon={Users}
              color="text-yellow-400"
              loading={loading}
            />
          </div>

          {/* Projects Section */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-montserrat font-bold text-xl text-white">
                  Your Projects ({projects.length})
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`border-gray-600 ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`border-gray-600 ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
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
                  <p className="text-gray-400 mb-6">Create your first AI video project to get started!</p>
                  <Button
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Video
                  </Button>
                </div>
              ) : (
                <div className={viewMode === 'grid'
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
                }>
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onView={handleProjectView}
                      onEdit={handleProjectEdit}
                      onDelete={handleProjectDelete}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {projects.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className="bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                onClick={() => setCreateModalOpen(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-montserrat font-bold text-white mb-2">Create Commercial</h3>
                  <p className="font-opensans text-gray-300 text-sm">Professional ads for your business</p>
                </CardContent>
              </Card>

              <Card
                className="bg-gradient-to-br from-accent/20 to-primary/20 border-accent/30 hover:border-accent/50 transition-all duration-300 cursor-pointer group"
                onClick={() => setCreateModalOpen(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-montserrat font-bold text-white mb-2">Social Media</h3>
                  <p className="font-opensans text-gray-300 text-sm">Engaging content for social platforms</p>
                </CardContent>
              </Card>

              <Card
                className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
                onClick={() => setCreateModalOpen(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-montserrat font-bold text-white mb-2">Explainer Video</h3>
                  <p className="font-opensans text-gray-300 text-sm">Clear and compelling explanations</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <ProjectDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        projectId={selectedProjectId}
        onEdit={handleProjectEdit}
      />
    </div>
  )
}

export default Dashboard
