import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Video, Users, Play, Sparkles, ArrowRight } from 'lucide-react'
import { createProject, CreateProjectData } from '@/lib/projectService'
import { toast } from '@/hooks/use-toast'

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  style: z.string().min(1, 'Please select a video style'),
  voiceType: z.string().min(1, 'Please select a voice type'),
  musicStyle: z.string().optional(),
  duration: z.number().min(15).max(300),
})

type ProjectFormData = z.infer<typeof projectSchema>

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated: () => void
}

const videoStyles = [
  { id: 'commercial', name: 'Commercial', description: 'Professional ads for your business', icon: Video },
  { id: 'social', name: 'Social Media', description: 'Engaging content for social platforms', icon: Users },
  { id: 'explainer', name: 'Explainer', description: 'Clear and compelling explanations', icon: Play },
  { id: 'brand-story', name: 'Brand Story', description: 'Authentic brand storytelling', icon: Sparkles },
]

const voiceTypes = [
  { id: 'professional-male', name: 'Professional Male', description: 'Authoritative and trustworthy' },
  { id: 'professional-female', name: 'Professional Female', description: 'Warm and engaging' },
  { id: 'casual-male', name: 'Casual Male', description: 'Friendly and approachable' },
  { id: 'casual-female', name: 'Casual Female', description: 'Conversational and relatable' },
  { id: 'energetic', name: 'Energetic', description: 'Dynamic and exciting' },
  { id: 'calm', name: 'Calm & Soothing', description: 'Peaceful and reassuring' },
]

const musicStyles = [
  { id: 'upbeat', name: 'Upbeat & Energetic' },
  { id: 'corporate', name: 'Corporate & Professional' },
  { id: 'emotional', name: 'Emotional & Inspiring' },
  { id: 'minimal', name: 'Minimal & Clean' },
  { id: 'cinematic', name: 'Cinematic & Dramatic' },
  { id: 'none', name: 'No Background Music' },
]

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      duration: 60,
      musicStyle: 'upbeat'
    }
  })

  const watchedStyle = watch('style')
  const watchedDuration = watch('duration')

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true)
    try {
      const { project, error } = await createProject(data)
      if (error) {
        toast({
          title: "Error creating project",
          description: error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Project created successfully!",
          description: "Your new video project is ready to be configured.",
        })
        onProjectCreated()
        handleClose()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    setSelectedStyle('')
    onClose()
  }

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId)
    setValue('style', styleId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-montserrat font-bold text-2xl text-white text-center">
            Create New Video Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Project Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-white font-opensans font-medium">
                Project Title
              </Label>
              <Input
                id="title"
                placeholder="Enter your video title"
                className="mt-2 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-white font-opensans font-medium">
                Description <span className="text-gray-400">(Optional)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your video concept..."
                className="mt-2 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-primary focus:ring-primary"
                rows={3}
                {...register('description')}
              />
            </div>
          </div>

          {/* Video Style Selection */}
          <div>
            <Label className="text-white font-opensans font-medium mb-3 block">
              Video Style
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {videoStyles.map((style) => (
                <Card
                  key={style.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedStyle === style.id
                      ? 'bg-primary/20 border-primary/50 ring-2 ring-primary/30'
                      : 'bg-gray-800/30 border-gray-600/50 hover:bg-gray-800/50'
                  }`}
                  onClick={() => handleStyleSelect(style.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        selectedStyle === style.id ? 'bg-primary/30' : 'bg-gray-700/50'
                      }`}>
                        <style.icon className={`w-5 h-5 ${
                          selectedStyle === style.id ? 'text-primary' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-opensans font-semibold text-white text-sm">
                          {style.name}
                        </h3>
                        <p className="font-opensans text-gray-400 text-xs">
                          {style.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {errors.style && (
              <p className="text-red-400 text-sm mt-2">{errors.style.message}</p>
            )}
          </div>

          {/* Voice and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white font-opensans font-medium">
                Voice Type
              </Label>
              <Select onValueChange={(value) => setValue('voiceType', value)}>
                <SelectTrigger className="mt-2 bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Select voice type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {voiceTypes.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id} className="text-white hover:bg-gray-700">
                      <div>
                        <div className="font-medium">{voice.name}</div>
                        <div className="text-sm text-gray-400">{voice.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.voiceType && (
                <p className="text-red-400 text-sm mt-1">{errors.voiceType.message}</p>
              )}
            </div>

            <div>
              <Label className="text-white font-opensans font-medium">
                Duration (seconds)
              </Label>
              <Input
                type="number"
                min="15"
                max="300"
                className="mt-2 bg-gray-800/50 border-gray-600 text-white"
                {...register('duration', { valueAsNumber: true })}
              />
              <p className="text-gray-400 text-xs mt-1">
                {watchedDuration ? `${Math.floor(watchedDuration / 60)}:${(watchedDuration % 60).toString().padStart(2, '0')}` : '1:00'}
              </p>
              {errors.duration && (
                <p className="text-red-400 text-sm mt-1">{errors.duration.message}</p>
              )}
            </div>
          </div>

          {/* Music Style */}
          <div>
            <Label className="text-white font-opensans font-medium">
              Background Music
            </Label>
            <Select onValueChange={(value) => setValue('musicStyle', value)} defaultValue="upbeat">
              <SelectTrigger className="mt-2 bg-gray-800/50 border-gray-600 text-white">
                <SelectValue placeholder="Select music style" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {musicStyles.map((music) => (
                  <SelectItem key={music.id} value={music.id} className="text-white hover:bg-gray-700">
                    {music.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
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
                  Create Project
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
