import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null

// Database helper functions
export const dbHelpers = {
  // Organizations
  async getOrganizations() {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createOrganization(organization: any) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
      .from('organizations')
      .insert([organization])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateOrganization(id: string, updates: any) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async deleteOrganization(id: string) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Employees
  async getEmployees(organizationId?: string) {
    if (!supabase) throw new Error('Supabase client not initialized')
    let query = supabase
      .from('employees')
      .select(`
        *,
        organizations (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },

  async createEmployee(employee: any) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updateEmployee(id: string, updates: any) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  async deleteEmployee(id: string) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Visitors
  async getVisitors(organizationId?: string) {
    if (!supabase) throw new Error('Supabase client not initialized')
    let query = supabase
      .from('visitors')
      .select(`
        *,
        organizations (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false })
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  },

  async createVisitor(visitor: any) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
      .from('visitors')
      .insert([visitor])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getVisitorByAadhar(aadharNumber: string) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .eq('aadhar_number', aadharNumber)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (error) throw error
    return data?.[0] || null
  },

  // Admin Users
  async getAdminUsers() {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async createAdminUser(user: any) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
      .from('admin_users')
      .insert([user])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async deleteAdminUser(id: string) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async authenticateUser(username: string, password: string) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()
    
    if (error) return null
    return data
  },

  // Analytics
  async getVisitorStats(organizationId?: string) {
    if (!supabase) throw new Error('Supabase client not initialized')
    let query = supabase
      .from('visitors')
      .select('visit_date, created_at')
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    const today = new Date().toISOString().split('T')[0]
    const todayVisits = data?.filter(v => v.visit_date === today).length || 0
    
    return {
      totalVisitors: data?.length || 0,
      todayVisits
    }
  },

  async getWeeklyVisitorData(organizationId?: string) {
    if (!supabase) throw new Error('Supabase client not initialized')
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    
    let query = supabase
      .from('visitors')
      .select('visit_date')
      .gte('visit_date', weekStart.toISOString().split('T')[0])
    
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    const weeklyData = [
      { day: 'Sun', visitors: 0 },
      { day: 'Mon', visitors: 0 },
      { day: 'Tue', visitors: 0 },
      { day: 'Wed', visitors: 0 },
      { day: 'Thu', visitors: 0 },
      { day: 'Fri', visitors: 0 },
      { day: 'Sat', visitors: 0 }
    ]
    
    data?.forEach(visitor => {
      if (visitor.visit_date) {
        const visitDate = new Date(visitor.visit_date)
        const dayOfWeek = visitDate.getDay()
        weeklyData[dayOfWeek].visitors += 1
      }
    })
    
    return weeklyData
  }
}