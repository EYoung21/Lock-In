import { createClient } from '@supabase/supabase-js'
import { SUPABASEURL, SUPABASEKEY } from '@env';

export const supabase = createClient(SUPABASEURL, SUPABASEKEY)