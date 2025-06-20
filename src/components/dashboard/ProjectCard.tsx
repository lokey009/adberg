import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Edit, 
  Download, 
  Share2, 
  MoreVertical, 
  Clock, 
  Calendar,
  Video,
  Trash2,
  Eye
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Project } from '@/lib/projectService'
import { formatDistanceToNow } from 'date-fns'

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
  onView?: (project: Project) => void
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

const getStatusIcon = (status: Project['status']) => {
  switch (status) {
    case 'completed':
      return <Video className="w-4 h-4" />
    case 'processing':
      return <Clock className="w-4 h-4 animate-spin" />
    case 'failed':
      return <Video className="w-4 h-4" />
    default:
      return <Edit className="w-4 h-4" />
  }
}

const formatDuration = (seconds?: number) => {
  if (!seconds) return 'N/A'
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onView
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation()
    switch (action) {
      case 'edit':
        onEdit?.(project)
        break
      case 'delete':
        onDelete?.(project)
        break
      case 'view':
        onView?.(project)
        break
    }
  }

  return (
    <Card 
      className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView?.(project)}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-opensans font-semibold text-white text-lg truncate">
                {project.title}
              </h3>
              {project.description && (
                <p className="font-opensans text-gray-400 text-sm mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <Badge className={`${getStatusColor(project.status)} border`}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(project.status)}
                  <span className="capitalize">{project.status}</span>
                </div>
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                  <DropdownMenuItem 
                    onClick={(e) => handleAction('view', e)}
                    className="hover:bg-gray-700 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => handleAction('edit', e)}
                    className="hover:bg-gray-700 cursor-pointer"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                  {project.status === 'completed' && project.videoUrl && (
                    <>
                      <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={(e) => handleAction('delete', e)}
                    className="hover:bg-gray-700 cursor-pointer text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Thumbnail/Preview */}
          <div className="relative aspect-video bg-gray-700/50 rounded-xl overflow-hidden">
            {project.thumbnailUrl ? (
              <img 
                src={project.thumbnailUrl} 
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Video className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No preview available</p>
                </div>
              </div>
            )}
            
            {/* Play overlay for completed videos */}
            {project.status === 'completed' && project.videoUrl && (
              <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
                <Button 
                  size="lg"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle video play
                  }}
                >
                  <Play className="w-6 h-6" />
                </Button>
              </div>
            )}

            {/* Processing overlay */}
            {project.status === 'processing' && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-white text-sm">Processing...</p>
                </div>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-400">
              {project.style && (
                <div className="flex items-center space-x-1">
                  <Video className="w-4 h-4" />
                  <span className="capitalize">{project.style.replace('-', ' ')}</span>
                </div>
              )}
              {project.duration && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(project.duration)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-1 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {project.status === 'completed' && project.videoUrl ? (
              <Button 
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle video play
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Video
              </Button>
            ) : project.status === 'draft' ? (
              <Button 
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                onClick={(e) => handleAction('edit', e)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Continue Editing
              </Button>
            ) : project.status === 'processing' ? (
              <Button 
                disabled
                className="flex-1"
              >
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:text-white"
                onClick={(e) => handleAction('edit', e)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
