import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://bzmixuxautbmqbrqtufx.supabase.co!;
const supabaseAnonKey = process.env.sb_publishable_p_kFlPj1v5_qaypk8YWCLA_sEY8NVOP!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
