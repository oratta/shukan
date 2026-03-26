'use server'

import { createClient } from '@/lib/supabase/server'

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Delete user data (cascade should handle this, but being explicit for safety)
  await supabase.from('daily_reflections').delete().eq('user_id', user.id)
  await supabase.from('habit_completions').delete().eq('user_id', user.id)
  await supabase.from('habits').delete().eq('user_id', user.id)
  await supabase.from('user_settings').delete().eq('user_id', user.id)

  // Sign out — auth.users deletion requires admin privileges (service_role key)
  // All user data is deleted above; the auth.users shell entry is left behind
  await supabase.auth.signOut()

  return { success: true }
}
