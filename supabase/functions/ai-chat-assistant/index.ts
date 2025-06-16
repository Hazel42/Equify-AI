
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  message: string;
  userId: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, userId, conversationHistory = [] }: RequestBody = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`🤖 AI Chat request from user ${userId}`)

    // Get user's relationships and recent favors for context
    const { data: relationships } = await supabaseClient
      .from('relationships')
      .select('*')
      .eq('user_id', userId)
      .limit(10)

    const { data: favors } = await supabaseClient
      .from('favors')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Prepare context for AI
    const contextInfo = {
      relationshipCount: relationships?.length || 0,
      recentFavors: favors?.length || 0,
      personalityType: profile?.personality_type || 'Not set'
    }

    // Enhanced system prompt for relationship advisor
    const systemPrompt = `You are an expert AI relationship advisor specializing in helping people build and maintain meaningful connections. You have access to the user's relationship data and should provide personalized, actionable advice.

Current user context:
- Has ${contextInfo.relationshipCount} relationships tracked
- ${contextInfo.recentFavors} recent interactions recorded
- Personality type: ${contextInfo.personalityType}

Your role is to:
1. Provide specific, actionable relationship advice
2. Help interpret relationship patterns and dynamics
3. Suggest practical ways to strengthen connections
4. Offer emotional intelligence insights
5. Help with conflict resolution and communication strategies
6. Provide timing suggestions for relationship actions

Keep responses conversational, empathetic, and practical. Ask clarifying questions when needed. Always consider the user's specific context and relationship data when giving advice.`

    // Build conversation context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8), // Keep last 8 messages for context
      { role: 'user', content: message }
    ]

    // Call DeepSeek AI for response
    const aiResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI API error:', aiResponse.status, errorText)
      throw new Error(`AI API error: ${aiResponse.status}`)
    }

    const aiResult = await aiResponse.json()
    const assistantResponse = aiResult.choices[0]?.message?.content

    if (!assistantResponse) {
      throw new Error('No response received from AI')
    }

    console.log('✅ AI Chat response generated successfully')

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in ai-chat-assistant:', error)
    return new Response(
      JSON.stringify({
        response: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment, or feel free to rephrase your question."
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 with fallback message instead of error
      }
    )
  }
})
