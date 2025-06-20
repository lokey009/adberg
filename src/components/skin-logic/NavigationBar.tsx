
import { useState } from 'react';
import { ChevronDown, CircleDot, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const NavigationBar = () => {
  const [activeTab, setActiveTab] = useState('skin-editor');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'skin-editor', label: 'Skin Editor', active: true },
    { id: 'upscaler', label: 'Upscaler' },
    { id: 'character-consistency', label: 'Character Consistency' },
  ];

  const additionalItems = [
    { id: 'tools', label: 'Tools', hasNotification: true },
    { id: 'gallery', label: 'Gallery' },
    { id: 'api-access', label: 'API Access' },
    { id: 'subscription', label: 'Subscription' },
  ];

  const MobileMenu = () => (
    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden text-derma-text-muted hover:text-derma-text"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-derma-card border-derma-border w-80">
        <SheetHeader>
          <SheetTitle className="text-derma-text">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {/* Main Navigation */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-derma-text-muted uppercase tracking-wide">Navigation</h3>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-derma-blue text-white'
                    : 'text-derma-text-muted hover:text-derma-text hover:bg-derma-border/30'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Additional Items */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-derma-text-muted uppercase tracking-wide">Tools & Features</h3>
            {additionalItems.map((item) => (
              <button
                key={item.id}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-derma-text-muted hover:text-derma-text hover:bg-derma-border/30 transition-colors flex items-center justify-between"
              >
                <span>{item.label}</span>
                {item.hasNotification && (
                  <CircleDot className="h-2 w-2 text-red-500" />
                )}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-derma-border">
            <Button className="w-full bg-derma-blue hover:bg-derma-blue-hover text-white">
              View Plans
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <nav className="border-b border-derma-border bg-derma-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <div className="text-2xl font-bold text-white">
              DermaLogic
            </div>

            {/* Navigation Items - Grouped as segmented control */}
            <div className="hidden md:flex items-center bg-derma-border/30 rounded-xl p-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-derma-blue text-white'
                      : 'text-derma-text-muted hover:text-derma-text'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Additional Navigation Items - Show on larger screens */}
            <div className="hidden xl:flex items-center space-x-1">
              {/* Tools Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium text-derma-text-muted hover:text-derma-text hover:bg-derma-border/30 transition-colors">
                    <span>Tools</span>
                    <div className="relative">
                      <ChevronDown className="h-4 w-4" />
                      <CircleDot className="h-2 w-2 text-red-500 absolute -top-1 -right-1" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-derma-card border-derma-border z-50">
                  <DropdownMenuItem className="text-derma-text hover:bg-derma-border/30">
                    Face Detection
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-derma-text hover:bg-derma-border/30">
                    Batch Processing
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-derma-text hover:bg-derma-border/30">
                    API Integration
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button className="px-4 py-2 rounded-lg text-sm font-medium text-derma-text-muted hover:text-derma-text hover:bg-derma-border/30 transition-colors">
                Gallery
              </button>
            </div>

            {/* Settings Dropdown for medium screens */}
            <div className="hidden md:flex xl:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium text-derma-text-muted hover:text-derma-text hover:bg-derma-border/30 transition-colors">
                    <span>More</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-derma-card border-derma-border z-50">
                  <DropdownMenuItem className="text-derma-text hover:bg-derma-border/30">
                    <div className="flex items-center justify-between w-full">
                      <span>Tools</span>
                      <CircleDot className="h-2 w-2 text-red-500" />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-derma-text hover:bg-derma-border/30">
                    Gallery
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-derma-text hover:bg-derma-border/30">
                    API Access
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-derma-text hover:bg-derma-border/30">
                    Subscription
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-4">
            {/* Desktop buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-derma-text-muted hover:text-derma-text hover:bg-derma-border/30"
              >
                API Access
              </Button>
              <Button
                variant="ghost"
                className="text-derma-text-muted hover:text-derma-text hover:bg-derma-border/30"
              >
                Subscription
              </Button>
              <Button className="bg-derma-blue hover:bg-derma-blue-hover text-white px-6">
                View Plans
              </Button>
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-derma-border text-derma-text hover:bg-derma-border/30 flex items-center space-x-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-derma-card border-derma-border z-50" align="end">
                <DropdownMenuItem className="text-derma-text hover:bg-derma-border/30">
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-derma-text hover:bg-derma-border/30">
                  My Content
                </DropdownMenuItem>
                <DropdownMenuItem className="text-derma-text hover:bg-derma-border/30">
                  Credits
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-derma-border" />
                <DropdownMenuItem className="text-derma-text hover:bg-derma-border/30">
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
