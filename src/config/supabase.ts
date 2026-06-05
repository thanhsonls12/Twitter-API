import { createClient } from '@supabase/supabase-js'
import { envConfig } from './env.js'

const supabase = createClient(
  envConfig.SUPABASE_URL,
  envConfig.SUPABASE_SERVICE_ROLE_KEY
)

export default supabase
