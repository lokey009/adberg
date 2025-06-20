import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Play, 
  Download, 
  Share2, 
  Edit, 
  Calendar,
  Clock,
  Video,
  Music,
  Mic,
  FileText,
  ExternalLink
} from 'lucide-react'
import { Project, getProject } from '@/lib/projectService'
import { formatDistanceToNow } from 'date-fns'

interface ProjectDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string | null
  onEdit?: (project: Project) => void
}

const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'processing':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    case 'failed':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

const formatDuration = (seconds?: number) => {
  if (!seconds) return 'Not specified'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onEdit
}) => {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && projectId) {
      fetchProject()
    }
  }, [isOpen, projectId])

  const fetchProject = async () => {
    if (!projectId) return
    
    setLoading(true)
    try {
      const { project: fetchedProject, error } = await getProject(projectId)
      if (error) {
        console.error('Error fetching project:', error)
      } else {
        setProject(fetchedProject)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (project && onEdit) {
      onEdit(project)
      onClose()
    }
  }

  if (!isOpen) return null

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!project) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
          <div className="text-center py-12">
            <p className="text-gray-400">Project not found</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="font-montserrat font-bold text-2xl text-white">
                {project.title}
              </DialogTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={`${getStatusColor(project.status)} border`}>
                  <span className="capitalize">{project.status}</span>
                </Badge>
                <span className="text-gray-400 text-sm">
                  Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Preview */}
          {project.status === 'completed' && project.videoUrl ? (
            <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden">
              <video 
                src={project.videoUrl} 
                controls 
                className="w-full h-full"
                poster={project.thumbnailUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : project.thumbnailUrl ? (
            <div className="aspect-video bg-gray-800 rounded-xl overflow-hidden relative">
              <img 
                src={project.thumbnailUrl} 
                alt={project.title}
                className="w-full h-full object-cover"
              />
              {project.status === 'processing' && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-white text-sm">Processing video...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500">No preview available</p>
              </div>
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div>
              <h3 className="font-opensans font-semibold text-white mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Description
              </h3>
              <p className="text-gray-300 font-opensans leading-relaxed">
                {project.description}
              </p>
            </div>
          )}

          <Separator className="bg-gray-700" />

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-opensans font-semibold text-white">Project Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center">
                    <Video className="w-4 h-4 mr-2" />
                    Style
                  </span>
                  <span className="text-white capitalize">
                    {project.style?.replace('-', ' ') || 'Not specified'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Duration
                  </span>
                  <span className="text-white">
                    {formatDuration(project.duration)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center">
                    <Mic className="w-4 h-4 mr-2" />
                    Voice Type
                  </span>
                  <span className="text-white capitalize">
                    {project.voiceType?.replace('-', ' ') || 'Not specified'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center">
                    <Music className="w-4 h-4 mr-2" />
                    Music Style
                  </span>
                  <span className="text-white capitalize">
                    {project.musicStyle?.replace('-', ' ') || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-opensans font-semibold text-white">Timeline</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created
                  </span>
                  <span className="text-white">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last Updated
                  </span>
                  <span className="text-white">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:text-white"
            >
              Close
            </Button>
            
            <Button
              onClick={handleEdit}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Project
            </Button>

            {project.status === 'completed' && project.videoUrl && (
              <>
                <Button
                  onClick={() => window.open(project.videoUrl, '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Video
                </Button>
                
                <Button
                  onClick={() => {
                    // Handle download
                    const link = document.createElement('a')
                    link.href = project.videoUrl!
                    link.download = `${project.title}.mp4`
                    link.click()
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
