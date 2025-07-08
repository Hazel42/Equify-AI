
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  message: string;
  userId: string;
  context?: {
    recentRelationships: any[];
    recentFavors: any[];
    userPersonality: string;
    conversationHistory: any[];
  };
  language?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { message, userId, context, language = 'en' }: RequestBody = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`🤖 AI Chat request from user ${userId}`)

    // Get comprehensive user data for context
    const { data: relationships } = await supabaseClient
      .from('relationships')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    const { data: favors } = await supabaseClient
      .from('favors')
      .select('*, relationships(name, relationship_type)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    const { data: recommendations } = await supabaseClient
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('priority_level', { ascending: false })
      .limit(10)

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Calculate relationship statistics
    const relationshipStats = relationships?.reduce((acc, rel) => {
      acc[rel.relationship_type] = (acc[rel.relationship_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Analyze favor patterns
    const favorStats = favors?.reduce((acc, favor) => {
      const type = favor.direction;
      acc[type] = (acc[type] || 0) + 1;
      if (favor.estimated_value) {
        acc[`${type}_value`] = (acc[`${type}_value`] || 0) + favor.estimated_value;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // Create detailed context
    const contextInfo = {
      relationshipCount: relationships?.length || 0,
      relationshipTypes: relationshipStats,
      totalFavors: favors?.length || 0,
      favorBalance: {
        given: favorStats.given || 0,
        received: favorStats.received || 0,
        givenValue: favorStats.given_value || 0,
        receivedValue: favorStats.received_value || 0,
      },
      pendingRecommendations: recommendations?.length || 0,
      personalityType: profile?.personality_type || 'Not set',
      reciprocityStyle: profile?.reciprocity_style || 'Not set',
    }

    // Enhanced system prompt for relationship advisor with detailed context
    const systemPrompt = `You are an expert AI relationship advisor with deep emotional intelligence and expertise in human connections. You can access the user's comprehensive relationship data to provide highly personalized advice.

CURRENT USER PROFILE:
- Total relationships tracked: ${contextInfo.relationshipCount}
- Relationship types: ${Object.entries(contextInfo.relationshipTypes).map(([type, count]) => `${count} ${type}`).join(', ') || 'None'}
- Total interactions: ${contextInfo.totalFavors}
- Give/Take balance: Given ${contextInfo.favorBalance.given}, Received ${contextInfo.favorBalance.received}
- Value balance: Given $${contextInfo.favorBalance.givenValue}, Received $${contextInfo.favorBalance.receivedValue}
- Pending recommendations: ${contextInfo.pendingRecommendations}
- Personality: ${contextInfo.personalityType}
- Reciprocity style: ${contextInfo.reciprocityStyle}

AVAILABLE DATA:
- All relationships with names, types, and importance levels
- Complete favor history with descriptions, values, and emotional weights
- Active recommendations and their priorities
- User personality traits and preferences

YOUR CAPABILITIES:
1. **Relationship Analysis**: Analyze specific relationships by name (e.g., "How is my relationship with Sarah?")
2. **Gift Suggestions**: Provide personalized gift ideas based on relationship history and favor patterns
3. **Communication Advice**: Suggest conversation starters, conflict resolution, and emotional approaches
4. **Balance Assessment**: Evaluate give-and-take dynamics in specific relationships
5. **Pattern Recognition**: Identify trends in interaction patterns and emotional investments
6. **Timing Guidance**: Suggest optimal timing for relationship actions based on history
7. **Personalized Strategies**: Tailor advice to user's personality type and reciprocity style

RESPONSE GUIDELINES:
- Use specific names and details from their relationship data
- Reference actual favor history when relevant
- Be conversational, empathetic, and actionable
- Ask follow-up questions to provide deeper insights
- Suggest concrete next steps
- Consider cultural and emotional contexts

${language === 'id' ? 'Respond in Indonesian (Bahasa Indonesia).' : 'Respond in English.'}

You have access to their actual relationship data, so be specific and personal in your advice.`

    // Build conversation with better context
    const conversationHistory = context?.conversationHistory?.slice(-6) || [];
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { 
        role: 'user', 
        content: `${message}

DETAILED CONTEXT:
Relationships: ${JSON.stringify(relationships?.map(r => ({ name: r.name, type: r.relationship_type, importance: r.importance_level })) || [])}
Recent Favors: ${JSON.stringify(favors?.slice(0, 10).map(f => ({ 
          description: f.description, 
          direction: f.direction, 
          person: f.relationships?.name,
          value: f.estimated_value,
          date: f.date_occurred 
        })) || [])}
Active Recommendations: ${JSON.stringify(recommendations?.map(r => ({ title: r.title, description: r.description, priority: r.priority_level })) || [])}`
      }
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
