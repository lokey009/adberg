import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Smile, User, Shirt, RefreshCw } from 'lucide-react';

export interface FaceParsingConfig {
  background: boolean;
  skin: boolean;
  nose: boolean;
  eye_g: boolean;
  r_eye: boolean;
  l_eye: boolean;
  r_brow: boolean;
  l_brow: boolean;
  r_ear: boolean;
  l_ear: boolean;
  mouth: boolean;
  u_lip: boolean;
  l_lip: boolean;
  hair: boolean;
  hat: boolean;
  ear_r: boolean;
  neck_l: boolean;
  neck: boolean;
  cloth: boolean;
}

interface FaceParsingConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: FaceParsingConfig) => void;
  isLoading?: boolean;
}

const defaultConfig: FaceParsingConfig = {
  background: false,
  skin: true,
  nose: true,
  eye_g: true,
  r_eye: true,
  l_eye: true,
  r_brow: true,
  l_brow: true,
  r_ear: false,
  l_ear: false,
  mouth: true,
  u_lip: true,
  l_lip: true,
  hair: true,
  hat: false,
  ear_r: false,
  neck_l: false,
  neck: false,
  cloth: false
};

const presets = {
  "Eyes Only": {
    background: false, skin: false, nose: false, eye_g: true, r_eye: true, l_eye: true,
    r_brow: true, l_brow: true, r_ear: false, l_ear: false, mouth: false, u_lip: false,
    l_lip: false, hair: false, hat: false, ear_r: false, neck_l: false, neck: false, cloth: false
  },
  "Full Face": {
    background: false, skin: true, nose: true, eye_g: true, r_eye: true, l_eye: true,
    r_brow: true, l_brow: true, r_ear: false, l_ear: false, mouth: true, u_lip: true,
    l_lip: true, hair: true, hat: false, ear_r: false, neck_l: false, neck: false, cloth: false
  },
  "Skin Only": {
    background: false, skin: true, nose: true, eye_g: false, r_eye: false, l_eye: false,
    r_brow: false, l_brow: false, r_ear: false, l_ear: false, mouth: false, u_lip: false,
    l_lip: false, hair: false, hat: false, ear_r: false, neck_l: false, neck: false, cloth: false
  },
  "Conservative": {
    background: false, skin: true, nose: false, eye_g: true, r_eye: true, l_eye: true,
    r_brow: false, l_brow: false, r_ear: false, l_ear: false, mouth: false, u_lip: true,
    l_lip: true, hair: false, hat: false, ear_r: false, neck_l: false, neck: false, cloth: false
  }
};

const configSections = [
  {
    title: "Eyes & Eyebrows",
    icon: <Eye className="h-4 w-4" />,
    items: [
      { key: 'eye_g', label: 'Eye Glasses Area', description: 'Area around eyes with glasses' },
      { key: 'r_eye', label: 'Right Eye', description: 'Right eye area' },
      { key: 'l_eye', label: 'Left Eye', description: 'Left eye area' },
      { key: 'r_brow', label: 'Right Eyebrow', description: 'Right eyebrow area' },
      { key: 'l_brow', label: 'Left Eyebrow', description: 'Left eyebrow area' }
    ]
  },
  {
    title: "Face & Skin",
    icon: <User className="h-4 w-4" />,
    items: [
      { key: 'skin', label: 'Skin', description: 'General facial skin' },
      { key: 'nose', label: 'Nose', description: 'Nose area' },
      { key: 'mouth', label: 'Mouth', description: 'Mouth area' },
      { key: 'u_lip', label: 'Upper Lip', description: 'Upper lip area' },
      { key: 'l_lip', label: 'Lower Lip', description: 'Lower lip area' }
    ]
  },
  {
    title: "Hair & Accessories",
    icon: <Smile className="h-4 w-4" />,
    items: [
      { key: 'hair', label: 'Hair', description: 'Hair area' },
      { key: 'hat', label: 'Hat/Headwear', description: 'Hat or headwear area' },
      { key: 'r_ear', label: 'Right Ear', description: 'Right ear area' },
      { key: 'l_ear', label: 'Left Ear', description: 'Left ear area' },
      { key: 'ear_r', label: 'Ear Accessories', description: 'Ear accessories/earrings' }
    ]
  },
  {
    title: "Body & Background",
    icon: <Shirt className="h-4 w-4" />,
    items: [
      { key: 'neck', label: 'Neck', description: 'Neck area' },
      { key: 'neck_l', label: 'Lower Neck', description: 'Lower neck area' },
      { key: 'cloth', label: 'Clothing', description: 'Clothing/garments' },
      { key: 'background', label: 'Background', description: 'Image background' }
    ]
  }
];

export default function FaceParsingConfig({ isOpen, onClose, onConfirm, isLoading = false }: FaceParsingConfigProps) {
  const [config, setConfig] = useState<FaceParsingConfig>(defaultConfig);

  console.log('🎭 FaceParsingConfig component rendered with isOpen:', isOpen);

  const updateConfig = (key: keyof FaceParsingConfig, value: boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (presetName: string) => {
    const preset = presets[presetName as keyof typeof presets];
    if (preset) {
      setConfig(preset);
    }
  };

  const resetToDefault = () => {
    setConfig(defaultConfig);
  };

  const getSelectedCount = () => {
    return Object.values(config).filter(Boolean).length;
  };

  const handleConfirm = () => {
    onConfirm(config);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Configure Face Enhancement Areas
          </DialogTitle>
          <DialogDescription>
            Select which areas of the face you want to enhance. The AI will focus processing on the selected areas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Presets */}
          <div>
            <h3 className="text-sm font-medium mb-3">Quick Presets</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(presets).map((presetName) => (
                <Button
                  key={presetName}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(presetName)}
                  className="text-xs"
                >
                  {presetName}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefault}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>

          <Separator />

          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {getSelectedCount()} areas selected
              </Badge>
            </div>
          </div>

          {/* Configuration Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configSections.map((section) => (
              <Card key={section.title} className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {section.icon}
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.key} className="flex items-start space-x-3">
                      <Checkbox
                        id={item.key}
                        checked={config[item.key as keyof FaceParsingConfig]}
                        onCheckedChange={(checked) => 
                          updateConfig(item.key as keyof FaceParsingConfig, checked as boolean)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={item.key}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {item.label}
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Warning */}
          {getSelectedCount() === 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ No areas selected. Please select at least one area to enhance.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={getSelectedCount() === 0 || isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              `Enhance ${getSelectedCount()} Areas`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 