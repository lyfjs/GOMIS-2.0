import React, { useEffect, useState } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar'
import { ThemeProvider } from './components/theme-provider'
import { DashboardSidebar } from './components/dashboard-sidebar'
import { DashboardContent } from './components/dashboard-content'
import { SettingsPanel } from './components/settings-panel'
import { LoginForm } from './components/auth/login-form'
import { RegisterForm } from './components/auth/register-form'
import { Separator } from './components/ui/separator'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './components/ui/breadcrumb'
import { Toaster } from './components/ui/sonner'

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleRegister = () => {
    setIsAuthenticated(true)
  }

  // Restore auth from localStorage and guard routes
  useEffect(() => {
    const user = localStorage.getItem('gomis_current_user')
    setIsAuthenticated(!!user)
  }, [])

  type Crumb = { title: string; isActive: boolean }
  const getBreadcrumbItems = (): Crumb[] => {
    const parts = activeSection.split('-')
    const items: Crumb[] = []
    
    if (parts[0] === 'settings') {
      return [{ title: 'Settings', isActive: true }]
    }
    
    // Main section
    const mainSection = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    items.push({ title: mainSection, isActive: parts.length === 1 })
    
    // Sub-section if exists
    if (parts.length > 1) {
      const subSection = parts.slice(1).join(' ').replace(/([A-Z])/g, ' $1').trim()
      const formattedSubSection = subSection.charAt(0).toUpperCase() + subSection.slice(1)
      items.push({ title: formattedSubSection, isActive: true })
    }
    
    return items
  }

  const breadcrumbItems = getBreadcrumbItems()

  const appBody = (
    <>
      <Toaster />
      {!isAuthenticated ? (
        authMode === 'login' ? (
          <LoginForm 
            onLogin={handleLogin}
            onSwitchToRegister={() => setAuthMode('register')}
          />
        ) : (
          <RegisterForm 
            onRegister={handleRegister}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )
      ) : (
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <DashboardSidebar 
              activeSection={activeSection} 
              onSectionChange={setActiveSection} 
            />
            <SidebarInset className="flex-1">
              <header className="flex h-16 shrink-0 items-center gap-2 transition-all duration-300 ease-in-out group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4 animate-slide-in-top">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      {breadcrumbItems.map((item, index) => (
                        <React.Fragment key={index}>
                          <BreadcrumbItem>
                            {item.isActive ? (
                              <BreadcrumbPage>{item.title}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink href="#" onClick={(e) => {
                                e.preventDefault()
                                setActiveSection(activeSection.split('-')[0])
                              }}>
                                {item.title}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </header>
              <main className="flex-1">
                <div key={activeSection} className="animate-fade-in">
                  {activeSection === 'settings' ? (
                    <SettingsPanel />
                  ) : (
                    <DashboardContent activeSection={activeSection} />
                  )}
                </div>
              </main>
            </SidebarInset>
          </div>
        </SidebarProvider>
      )}
    </>
  )

  return (
    <ThemeProvider children={appBody} />
  )
}