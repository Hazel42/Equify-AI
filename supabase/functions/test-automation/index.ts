
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  userId: string;
  rules: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, rules }: RequestBody = await req.json()
    
    console.log(`🔧 Testing automation for user ${userId} with ${rules.length} rules`)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let processedRules = 0

    for (const rule of rules) {
      if (!rule.enabled) continue

      try {
        switch (rule.type) {
          case 'reminder':
            console.log(`Processing reminder rule: ${rule.name}`)
            // Simulate reminder creation logic
            processedRules++
            break
            
          case 'categorization':
            console.log(`Processing categorization rule: ${rule.name}`)
            // Simulate auto-categorization logic
            processedRules++
            break
            
          case 'priority_adjustment':
            console.log(`Processing priority adjustment rule: ${rule.name}`)
            // Simulate priority adjustment logic
            processedRules++
            break
            
          case 'notification':
            console.log(`Processing notification rule: ${rule.name}`)
            // Simulate notification logic
            processedRules++
            break
            
          default:
            console.log(`Unknown rule type: ${rule.type}`)
        }
      } catch (ruleError) {
        console.error(`Error processing rule ${rule.name}:`, ruleError)
      }
    }

    console.log(`✅ Processed ${processedRules} automation rules`)

    return new Response(
      JSON.stringify({
        success: true,
        processedRules,
        message: `Successfully tested ${processedRules} automation rules`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in test-automation:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        processedRules: 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
