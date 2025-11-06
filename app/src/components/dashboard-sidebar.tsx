import React, { useState } from 'react'
import {
  LayoutDashboard,
  Calendar,
  Users,
  AlertTriangle,
  ClipboardList,
  Settings,
  ChevronDown,
  GraduationCap
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from './ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import logo from '../assets/logo.png'

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    id: 'dashboard',
    children: []
  },
  {
    title: 'Appointments',
    icon: Calendar,
    id: 'appointments',
    children: [
      { title: 'Calendar View', id: 'calendar' },
      { title: 'Schedule', id: 'schedule' }
    ]
  },
  {
    title: 'Sessions',
    icon: Users,
    id: 'sessions',
    children: [
      { title: 'Session Fill-Up Form', id: 'session-fillup' },
      { title: 'Session Records', id: 'session-records' }
    ]
  },
  {
    title: 'Student Management',
    icon: GraduationCap,
    id: 'students',
    children: [
      { title: 'Create Student', id: 'create-student' },
      { title: 'Student Data', id: 'student-data' }
    ]
  },
  {
    title: 'Incident Management',
    icon: AlertTriangle,
    id: 'incidents',
    children: [
      { title: 'Incident Fill-Up Form', id: 'incident-fillup' },
      { title: 'Incident Records', id: 'incident-records' }
    ]
  },
  {
    title: 'Violation Records',
    icon: ClipboardList,
    id: 'violations',
    children: []
  }
]

interface DashboardSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function DashboardSidebar({ activeSection, onSectionChange }: DashboardSidebarProps) {
  const [openSections, setOpenSections] = useState<string[]>(['dashboard'])

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <img src={logo} alt="School Logo" className="h-12 w-12 rounded-full" />
          <div>
            <h2>Guidance Office</h2>
            <p className="text-muted-foreground">Management System</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                item.children.length > 0 ? (
                  <Collapsible
                    key={item.id}
                    open={openSections.includes(item.id)}
                    onOpenChange={() => toggleSection(item.id)}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          onClick={() => onSectionChange(item.id)}
                          className={activeSection === item.id || activeSection.startsWith(item.id) ? 'bg-sidebar-accent' : ''}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 ui-open:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden">
                        <SidebarMenuSub>
                          {item.children.map((child, index) => (
                            <SidebarMenuSubItem 
                              key={child.id}
                              style={{ 
                                '--stagger-delay': `${index * 50}ms`,
                                animationDelay: `${index * 50}ms`
                              } as React.CSSProperties}
                              className="dropdown-menu-item"
                            >
                              <SidebarMenuSubButton
                                onClick={() => onSectionChange(`${item.id}-${child.id}`)}
                                className={activeSection === `${item.id}-${child.id}` ? 'bg-sidebar-accent' : ''}
                              >
                                {child.title}
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onSectionChange(item.id)}
                      className={activeSection === item.id ? 'bg-sidebar-accent' : ''}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onSectionChange('settings')}
              className={activeSection === 'settings' ? 'bg-sidebar-accent' : ''}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}