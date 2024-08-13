import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASEURL
const supabaseKey = process.env.SUPABASEKEY
export const supabase = createClient(supabaseUrl, supabaseKey)