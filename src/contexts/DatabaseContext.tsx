import React, { createContext, useContext, useState, useEffect } from 'react'
import { dbHelpers } from '../lib/supabase'

interface DatabaseContextType {
  isOnline: boolean
  isSupabaseConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
  syncData: () => Promise<void>
  getOrganizations: () => Promise<any[]>
  createOrganization: (org: any) => Promise<any>
  getEmployees: (orgId?: string) => Promise<any[]>
  createEmployee: (emp: any) => Promise<any>
  updateEmployee: (id: string, updates: any) => Promise<any>
  deleteEmployee: (id: string) => Promise<void>
  getVisitors: (orgId?: string) => Promise<any[]>
  createVisitor: (visitor: any) => Promise<any>
  getVisitorByAadhar: (aadhar: string) => Promise<any>
  getAdminUsers: () => Promise<any[]>
  createAdminUser: (user: any) => Promise<any>
  deleteAdminUser: (id: string) => Promise<void>
  authenticateUser: (username: string, password: string) => Promise<any>
  getVisitorStats: (orgId?: string) => Promise<any>
  getWeeklyVisitorData: (orgId?: string) => Promise<any[]>
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined)

export const useDatabase = () => {
  const context = useContext(DatabaseContext)
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return context
}

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      setConnectionStatus('connecting')
      try {
        await dbHelpers.getOrganizations()
        setIsSupabaseConnected(true)
        setConnectionStatus('connected')
        console.log('✅ Supabase connection successful')
        
        // Show connection notification
        const notification = document.createElement('div')
        notification.className = 'notification-success'
        notification.textContent = '✅ Connected to Supabase database successfully!'
        document.body.appendChild(notification)
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 5000)
      } catch (error) {
        setIsSupabaseConnected(false)
        setConnectionStatus('disconnected')
        console.log('❌ Supabase connection failed, using localStorage fallback')
        console.error('Connection error:', error)
        
        // Show error notification
        const notification = document.createElement('div')
        notification.className = 'notification-error'
        notification.textContent = '❌ Supabase connection failed. Using offline mode.'
        document.body.appendChild(notification)
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 5000)
      }
    }
    
    testConnection()
    
    // Retry connection every 30 seconds if disconnected
    const retryInterval = setInterval(() => {
      if (!isSupabaseConnected && isOnline) {
        testConnection()
      }
    }, 30000)
    
    return () => clearInterval(retryInterval)
  }, [])
  // Fallback to localStorage when offline
  const getLocalData = (key: string) => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]')
    } catch {
      return []
    }
  }

  const setLocalData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data))
  }

  const syncData = async () => {
    if (!isOnline) return

    try {
      // Sync organizations
      const localOrgs = getLocalData('organizations')
      for (const org of localOrgs) {
        if (!org.synced) {
          await dbHelpers.createOrganization(org)
          org.synced = true
        }
      }
      setLocalData('organizations', localOrgs)

      // Sync employees
      const localEmployees = getLocalData('employees')
      for (const emp of localEmployees) {
        if (!emp.synced) {
          await dbHelpers.createEmployee(emp)
          emp.synced = true
        }
      }
      setLocalData('employees', localEmployees)

      // Sync visitors
      const localVisitors = getLocalData('visitors')
      for (const visitor of localVisitors) {
        if (!visitor.synced) {
          await dbHelpers.createVisitor(visitor)
          visitor.synced = true
        }
      }
      setLocalData('visitors', localVisitors)

      console.log('Data synced successfully')
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  const getOrganizations = async () => {
    if (isOnline && isSupabaseConnected) {
      try {
        const data = await dbHelpers.getOrganizations()
        setLocalData('organizations', data)
        return data
      } catch (error) {
        console.error('Failed to fetch organizations:', error)
        return getLocalData('organizations')
      }
    }
    return getLocalData('organizations')
  }

  const createOrganization = async (org: any) => {
    const newOrg = { ...org, synced: isOnline && isSupabaseConnected }
    
    if (isOnline && isSupabaseConnected) {
      try {
        const result = await dbHelpers.createOrganization(newOrg)
        const localOrgs = getLocalData('organizations')
        localOrgs.push(result)
        setLocalData('organizations', localOrgs)
        return result
      } catch (error) {
        console.error('Failed to create organization:', error)
        const localOrgs = getLocalData('organizations')
        localOrgs.push(newOrg)
        setLocalData('organizations', localOrgs)
        return newOrg
      }
    } else {
      const localOrgs = getLocalData('organizations')
      localOrgs.push(newOrg)
      setLocalData('organizations', localOrgs)
      return newOrg
    }
  }

  const getEmployees = async (orgId?: string) => {
    if (isOnline) {
      try {
        const data = await dbHelpers.getEmployees(orgId)
        setLocalData('employees', data)
        return data
      } catch (error) {
        console.error('Failed to fetch employees:', error)
        const localData = getLocalData('employees')
        return orgId ? localData.filter((emp: any) => emp.organization_id === orgId) : localData
      }
    }
    const localData = getLocalData('employees')
    return orgId ? localData.filter((emp: any) => emp.organization_id === orgId) : localData
  }

  const createEmployee = async (emp: any) => {
    const newEmp = { ...emp, synced: isOnline }
    
    if (isOnline) {
      try {
        const result = await dbHelpers.createEmployee(newEmp)
        const localEmps = getLocalData('employees')
        localEmps.push(result)
        setLocalData('employees', localEmps)
        return result
      } catch (error) {
        console.error('Failed to create employee:', error)
        const localEmps = getLocalData('employees')
        localEmps.push(newEmp)
        setLocalData('employees', localEmps)
        return newEmp
      }
    } else {
      const localEmps = getLocalData('employees')
      localEmps.push(newEmp)
      setLocalData('employees', localEmps)
      return newEmp
    }
  }

  const updateEmployee = async (id: string, updates: any) => {
    if (isOnline) {
      try {
        const result = await dbHelpers.updateEmployee(id, updates)
        const localEmps = getLocalData('employees')
        const index = localEmps.findIndex((emp: any) => emp.id === id)
        if (index !== -1) {
          localEmps[index] = result
          setLocalData('employees', localEmps)
        }
        return result
      } catch (error) {
        console.error('Failed to update employee:', error)
        const localEmps = getLocalData('employees')
        const index = localEmps.findIndex((emp: any) => emp.id === id)
        if (index !== -1) {
          localEmps[index] = { ...localEmps[index], ...updates, synced: false }
          setLocalData('employees', localEmps)
        }
        return localEmps[index]
      }
    } else {
      const localEmps = getLocalData('employees')
      const index = localEmps.findIndex((emp: any) => emp.id === id)
      if (index !== -1) {
        localEmps[index] = { ...localEmps[index], ...updates, synced: false }
        setLocalData('employees', localEmps)
      }
      return localEmps[index]
    }
  }

  const deleteEmployee = async (id: string) => {
    if (isOnline) {
      try {
        await dbHelpers.deleteEmployee(id)
      } catch (error) {
        console.error('Failed to delete employee:', error)
      }
    }
    
    const localEmps = getLocalData('employees')
    const filtered = localEmps.filter((emp: any) => emp.id !== id)
    setLocalData('employees', filtered)
  }

  const getVisitors = async (orgId?: string) => {
    if (isOnline) {
      try {
        const data = await dbHelpers.getVisitors(orgId)
        setLocalData('visitors', data)
        return data
      } catch (error) {
        console.error('Failed to fetch visitors:', error)
        const localData = getLocalData('visitors')
        return orgId ? localData.filter((v: any) => v.organization_id === orgId) : localData
      }
    }
    const localData = getLocalData('visitors')
    return orgId ? localData.filter((v: any) => v.organization_id === orgId) : localData
  }

  const createVisitor = async (visitor: any) => {
    const newVisitor = { ...visitor, synced: isOnline }
    
    if (isOnline) {
      try {
        const result = await dbHelpers.createVisitor(newVisitor)
        const localVisitors = getLocalData('visitors')
        localVisitors.push(result)
        setLocalData('visitors', localVisitors)
        return result
      } catch (error) {
        console.error('Failed to create visitor:', error)
        const localVisitors = getLocalData('visitors')
        localVisitors.push(newVisitor)
        setLocalData('visitors', localVisitors)
        return newVisitor
      }
    } else {
      const localVisitors = getLocalData('visitors')
      localVisitors.push(newVisitor)
      setLocalData('visitors', localVisitors)
      return newVisitor
    }
  }

  const getVisitorByAadhar = async (aadhar: string) => {
    if (isOnline) {
      try {
        return await dbHelpers.getVisitorByAadhar(aadhar)
      } catch (error) {
        console.error('Failed to fetch visitor by Aadhar:', error)
        const localVisitors = getLocalData('visitors')
        return localVisitors.find((v: any) => v.aadhar_number === aadhar) || null
      }
    }
    const localVisitors = getLocalData('visitors')
    return localVisitors.find((v: any) => v.aadhar_number === aadhar) || null
  }

  const getAdminUsers = async () => {
    if (isOnline) {
      try {
        const data = await dbHelpers.getAdminUsers()
        setLocalData('adminUsers', data)
        return data
      } catch (error) {
        console.error('Failed to fetch admin users:', error)
        return getLocalData('adminUsers')
      }
    }
    return getLocalData('adminUsers')
  }

  const createAdminUser = async (user: any) => {
    const newUser = { ...user, synced: isOnline }
    
    if (isOnline) {
      try {
        const result = await dbHelpers.createAdminUser(newUser)
        const localUsers = getLocalData('adminUsers')
        localUsers.push(result)
        setLocalData('adminUsers', localUsers)
        return result
      } catch (error) {
        console.error('Failed to create admin user:', error)
        const localUsers = getLocalData('adminUsers')
        localUsers.push(newUser)
        setLocalData('adminUsers', localUsers)
        return newUser
      }
    } else {
      const localUsers = getLocalData('adminUsers')
      localUsers.push(newUser)
      setLocalData('adminUsers', localUsers)
      return newUser
    }
  }

  const deleteAdminUser = async (id: string) => {
    if (isOnline) {
      try {
        await dbHelpers.deleteAdminUser(id)
      } catch (error) {
        console.error('Failed to delete admin user:', error)
      }
    }
    
    const localUsers = getLocalData('adminUsers')
    const filtered = localUsers.filter((user: any) => user.id !== id)
    setLocalData('adminUsers', filtered)
  }

  const authenticateUser = async (username: string, password: string) => {
    if (isOnline) {
      try {
        return await dbHelpers.authenticateUser(username, password)
      } catch (error) {
        console.error('Failed to authenticate user:', error)
        const localUsers = getLocalData('adminUsers')
        return localUsers.find((u: any) => u.username === username && u.password === password) || null
      }
    }
    const localUsers = getLocalData('adminUsers')
    return localUsers.find((u: any) => u.username === username && u.password === password) || null
  }

  const getVisitorStats = async (orgId?: string) => {
    if (isOnline) {
      try {
        return await dbHelpers.getVisitorStats(orgId)
      } catch (error) {
        console.error('Failed to fetch visitor stats:', error)
      }
    }
    
    const localVisitors = getLocalData('visitors')
    const filteredVisitors = orgId ? localVisitors.filter((v: any) => v.organization_id === orgId) : localVisitors
    const today = new Date().toISOString().split('T')[0]
    const todayVisits = filteredVisitors.filter((v: any) => v.visit_date === today).length
    
    return {
      totalVisitors: filteredVisitors.length,
      todayVisits
    }
  }

  const getWeeklyVisitorData = async (orgId?: string) => {
    if (isOnline) {
      try {
        return await dbHelpers.getWeeklyVisitorData(orgId)
      } catch (error) {
        console.error('Failed to fetch weekly visitor data:', error)
      }
    }
    
    const localVisitors = getLocalData('visitors')
    const filteredVisitors = orgId ? localVisitors.filter((v: any) => v.organization_id === orgId) : localVisitors
    
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    
    const weeklyData = [
      { day: 'Sun', visitors: 0 },
      { day: 'Mon', visitors: 0 },
      { day: 'Tue', visitors: 0 },
      { day: 'Wed', visitors: 0 },
      { day: 'Thu', visitors: 0 },
      { day: 'Fri', visitors: 0 },
      { day: 'Sat', visitors: 0 }
    ]
    
    filteredVisitors.forEach((visitor: any) => {
      if (visitor.visit_date) {
        const visitDate = new Date(visitor.visit_date)
        const dayOfWeek = visitDate.getDay()
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        
        if (visitDate >= weekStart && visitDate <= weekEnd) {
          weeklyData[dayOfWeek].visitors += 1
        }
      }
    })
    
    return weeklyData
  }

  return (
    <DatabaseContext.Provider value={{
      isOnline,
      isSupabaseConnected,
      connectionStatus,
      syncData,
      getOrganizations,
      createOrganization,
      getEmployees,
      createEmployee,
      updateEmployee,
      deleteEmployee,
      getVisitors,
      createVisitor,
      getVisitorByAadhar,
      getAdminUsers,
      createAdminUser,
      deleteAdminUser,
      authenticateUser,
      getVisitorStats,
      getWeeklyVisitorData
    }}>
      {children}
    </DatabaseContext.Provider>
  )
}