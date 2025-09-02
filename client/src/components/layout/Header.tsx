import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, X, Pill, Activity, Settings, Shield, FileText, Award } from 'lucide-react';
import { NAV_ITEMS, APP_NAME, ADMIN_NAV_ITEMS } from '@/lib/constants';
import SwitchRole from '@/components/ui/switch-role';
import useAuth from '@/hooks/useAuth';
import { NewHealthInsightLogo } from '@/assets';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 md:py-6 flex justify-between items-center">
        <div className="flex items-center flex-shrink-0">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center">
                <div className="mr-2 sm:mr-3">
                  <img 
                    src={NewHealthInsightLogo} 
                    alt="Health Insight Ventures Logo" 
                    className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto max-w-full" 
                  />
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-montserrat font-bold text-[#114e2b] cursor-pointer sr-only">
                  Health Insight Ventures
                </h1>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 xl:space-x-6 flex-shrink min-w-0">
          {NAV_ITEMS.map((item) => (
            <div key={item.href}>
              <Link href={item.href}>
                <div className={`text-gray-700 hover:text-primary font-medium cursor-pointer text-sm lg:text-base whitespace-nowrap ${
                  location === item.href ? 'text-primary' : ''
                }`}>
                  {item.name}
                </div>
              </Link>
            </div>
          ))}
          
          {isAuthenticated ? (
            <div className="flex items-center gap-1 lg:gap-2 xl:gap-3 ml-2 lg:ml-4">
              <span className="text-xs lg:text-sm text-gray-600 mr-1 lg:mr-2 hidden lg:block">
                Welcome, {user?.firstName || user?.username}!
              </span>
              {user?.role === 'admin' && (
                <div className="flex items-center gap-1 lg:gap-2 mr-1 lg:mr-2">
                  <Link href="/admin/audit-logs">
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary text-xs lg:text-sm p-1 lg:p-2">
                      <Activity size={16} className="mr-0 lg:mr-1" />
                      <span className="hidden xl:inline">Audit Logs</span>
                    </Button>
                  </Link>
                  <Link href="/admin/state-compliance">
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary text-xs lg:text-sm p-1 lg:p-2">
                      <Shield size={16} className="mr-0 lg:mr-1" />
                      <span className="hidden xl:inline">State Compliance</span>
                    </Button>
                  </Link>
                </div>
              )}
              <Link href="/profile">
                <Button variant="outline" className="flex items-center space-x-1 lg:space-x-2 text-primary border-primary hover:bg-primary hover:text-white text-xs lg:text-sm p-1 lg:p-2">
                  <User size={16} />
                  <span className="hidden lg:inline">My Account</span>
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex space-x-1 lg:space-x-2">
              <Link href="/login">
                <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white text-xs lg:text-sm p-1 lg:p-2">
                  Log In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary text-white hover:bg-primary/90 text-xs lg:text-sm p-1 lg:p-2">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </nav>
        
        {/* Mobile menu button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden p-1 sm:p-2 flex-shrink-0">
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] sm:w-[350px] bg-[#114e2b] border-none text-amber-200">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-amber-200">Menu</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5 text-amber-200" />
                </Button>
              </div>
              <nav className="flex flex-col space-y-4">
                {NAV_ITEMS.map((item) => (
                  <div key={item.href} onClick={() => setIsOpen(false)}>
                    <Link href={item.href}>
                      <div 
                        className={`py-2 text-base cursor-pointer ${
                          location === item.href ? 'text-amber-300 font-medium' : 'text-amber-200 hover:text-amber-300'
                        }`}
                      >
                        {item.name}
                      </div>
                    </Link>
                  </div>
                ))}
                
                <div className="border-t border-amber-200/20 pt-4 mt-2">
                  {isAuthenticated ? (
                    <>
                      <div onClick={() => setIsOpen(false)}>
                        <Link href="/profile">
                          <div className="flex items-center py-2 text-amber-200 hover:text-amber-300 font-medium cursor-pointer">
                            <User size={18} className="mr-2" />
                            My Profile
                          </div>
                        </Link>
                      </div>
                      <div onClick={() => setIsOpen(false)}>
                        <Link href="/twilio">
                          <div className="flex items-center py-2 text-amber-200 hover:text-amber-300 font-medium cursor-pointer">
                            <Settings size={18} className="mr-2" />
                            SMS Settings
                          </div>
                        </Link>
                      </div>
                      <div onClick={() => setIsOpen(false)}>
                        <Link href="/medication-refill">
                          <div className="flex items-center py-2 text-amber-200 hover:text-amber-300 font-medium cursor-pointer">
                            <Pill size={18} className="mr-2" />
                            Medication Refill
                          </div>
                        </Link>
                      </div>
                      <div onClick={() => setIsOpen(false)}>
                        <Link href="/risk-assessment">
                          <div className="flex items-center py-2 text-amber-200 hover:text-amber-300 font-medium cursor-pointer">
                            <Activity size={18} className="mr-2" />
                            Health Risk Assessment
                          </div>
                        </Link>
                      </div>
                      
                      <div onClick={() => setIsOpen(false)}>
                        <Link href="/rewards">
                          <div className="flex items-center py-2 text-amber-200 hover:text-amber-300 font-medium cursor-pointer">
                            <Award size={18} className="mr-2" />
                            Health Rewards
                          </div>
                        </Link>
                      </div>
                      
                      {/* Admin Navigation Items */}
                      {user?.role === 'admin' && (
                        <>
                          <div className="border-t border-amber-200/20 pt-4 mt-2">
                            <h3 className="text-sm text-amber-300 mb-2 font-semibold">ADMIN FEATURES</h3>
                            <div onClick={() => setIsOpen(false)}>
                              <Link href="/admin/audit-logs">
                                <div className="flex items-center py-2 text-amber-200 hover:text-amber-300 font-medium cursor-pointer">
                                  <Activity size={18} className="mr-2" />
                                  Audit Logs
                                </div>
                              </Link>
                            </div>
                            <div onClick={() => setIsOpen(false)}>
                              <Link href="/admin/state-compliance">
                                <div className="flex items-center py-2 text-amber-200 hover:text-amber-300 font-medium cursor-pointer">
                                  <Shield size={18} className="mr-2" />
                                  State Compliance
                                </div>
                              </Link>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link href="/login">
                        <Button 
                          variant="outline" 
                          className="w-full justify-center bg-transparent text-amber-200 border-amber-200 hover:bg-amber-200 hover:text-[#114e2b]"
                          onClick={() => setIsOpen(false)}
                        >
                          Log In
                        </Button>
                      </Link>
                      <Link href="/register">
                        <Button 
                          className="w-full justify-center bg-amber-200 text-[#114e2b] hover:bg-amber-300"
                          onClick={() => setIsOpen(false)}
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Role switcher */}
      {isAuthenticated && <SwitchRole />}
    </header>
  );
};

export default Header;
