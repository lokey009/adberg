import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  color: string
  loading?: boolean
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
  loading = false
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-400'
      case 'negative':
        return 'text-red-400'
      default:
        return color
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
              <div className="h-8 bg-gray-700 rounded animate-pulse w-16"></div>
              <div className="h-3 bg-gray-700 rounded animate-pulse w-24"></div>
            </div>
            <div className="p-3 rounded-xl bg-gray-700/50">
              <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-opensans text-gray-400 text-sm">{title}</p>
            <p className="font-montserrat font-bold text-2xl text-white mt-1">
              {value}
            </p>
            {change && (
              <p className={`font-opensans text-sm mt-1 ${getChangeColor()}`}>
                {change}
              </p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-gray-700/50 group-hover:bg-gray-700/70 transition-colors duration-300">
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
