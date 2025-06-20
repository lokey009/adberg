import { useState } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface PreservedAreasPanelProps {
  preservedAreas: string[];
  onPreservedAreasChange: (areas: string[]) => void;
}

const PreservedAreasPanel = ({ preservedAreas, onPreservedAreasChange }: PreservedAreasPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const areaGroups = {
    Face: ['Skin', 'Nose', 'Mouth', 'Upper Lip', 'Lower Lip'],
    Eyes: ['Eye General', 'Left Eye', 'Right Eye', 'Left Brow', 'Right Brow'],
    Head: ['Hair', 'Hat', 'Left Ear', 'Right Ear', 'Ear Ring'],
    Body: ['Neck', 'Neck Line', 'Clothing', 'Background']
  };

  const toggleArea = (area: string) => {
    const newAreas = preservedAreas.includes(area)
      ? preservedAreas.filter(a => a !== area)
      : [...preservedAreas, area];
    onPreservedAreasChange(newAreas);
  };

  const resetAll = () => {
    onPreservedAreasChange([]);
  };

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full p-6 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
            <div className="text-left">
              <h2 className="text-xl font-semibold text-white mb-2">Keep Certain Areas Unchanged</h2>
              <p className="text-sm text-gray-400">
                These options control which facial features will be preserved during enhancement.
              </p>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="px-6 pb-6">
          <div className="space-y-6">
            {Object.entries(areaGroups).map(([groupName, areas]) => (
              <div key={groupName} className="space-y-3">
                <h3 className="font-medium text-white text-sm uppercase tracking-wide">
                  {groupName}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {areas.map((area) => (
                    <Badge
                      key={area}
                      variant={preservedAreas.includes(area) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        preservedAreas.includes(area)
                          ? 'bg-primary hover:bg-primary/90 text-white border-primary'
                          : 'border-gray-700 text-gray-400 hover:border-primary/50 hover:text-white'
                      }`}
                      onClick={() => toggleArea(area)}
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}

            {/* Reset Button */}
            <div className="pt-4 border-t border-gray-800">
              <Button
                variant="outline"
                size="sm"
                onClick={resetAll}
                className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            </div>

            {/* Selected Areas Summary */}
            {preservedAreas.length > 0 && (
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">
                  {preservedAreas.length} area{preservedAreas.length !== 1 ? 's' : ''} selected for preservation
                </p>
                <div className="flex flex-wrap gap-1">
                  {preservedAreas.map((area) => (
                    <Badge
                      key={area}
                      variant="secondary"
                      className="text-xs bg-primary/20 text-primary border-primary/30"
                    >
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PreservedAreasPanel;
