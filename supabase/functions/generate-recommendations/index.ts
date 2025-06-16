
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  userId: string;
  relationshipId: string;
  context?: string;
  language?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, relationshipId, context, language = 'en' }: RequestBody = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`🤖 Starting AI analysis for relationship ${relationshipId}`)

    // Get relationship details with better error handling
    const { data: relationship, error: relError } = await supabaseClient
      .from('relationships')
      .select('*')
      .eq('id', relationshipId)
      .eq('user_id', userId)
      .single()

    if (relError || !relationship) {
      console.error('Relationship fetch error:', relError)
      throw new Error(`Relationship not found: ${relError?.message || 'Unknown error'}`)
    }

    // Get recent favors for this relationship
    const { data: favors, error: favorsError } = await supabaseClient
      .from('favors')
      .select('*')
      .eq('relationship_id', relationshipId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (favorsError) {
      console.error('Error fetching favors:', favorsError)
    }

    // Get user profile for personalization
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    // Prepare context for AI
    const recentFavors = favors || []
    const givenCount = recentFavors.filter(f => f.direction === 'given').length
    const receivedCount = recentFavors.filter(f => f.direction === 'received').length
    const balance = givenCount - receivedCount

    // Enhanced system prompt for better AI responses
    const systemPrompt = `You are an expert relationship advisor AI that helps users build balanced, meaningful connections. 
    Analyze the relationship data provided and give specific, actionable recommendations to strengthen this relationship.
    Focus on practical actions that consider the current balance and relationship dynamics.
    Always provide recommendations in clear, easy-to-understand English.`

    const userPrompt = `Analyze this relationship and provide recommendations:

Relationship Details:
- Name: ${relationship.name}
- Type: ${relationship.relationship_type}
- Importance Level: ${relationship.importance_level}/5
- Favors Given: ${givenCount}
- Favors Received: ${receivedCount}
- Balance: ${balance > 0 ? `+${balance} (giving more)` : balance < 0 ? `${balance} (receiving more)` : 'balanced'}

Recent Favors (Last 5):
${recentFavors.slice(0, 5).map(f => `- ${f.direction === 'given' ? 'Gave' : 'Received'}: ${f.description} (${f.category})`).join('\n') || 'No recent favors recorded'}

${context ? `Additional Context: ${context}` : ''}

User Profile:
- Personality Type: ${profile?.personality_type || 'Not set'}

Please provide 2-3 specific, actionable recommendations to strengthen this relationship. Consider the current balance and suggest ways to improve connection quality.

Format your response as JSON:
{
  "recommendations": [
    {
      "title": "Clear, specific recommendation title",
      "description": "Detailed explanation of what to do and why",
      "priority": "high|medium|low",
      "category": "communication|favor|emotional_support|quality_time|appreciation",
      "estimated_time_minutes": 15,
      "reasoning": "Why this recommendation is important for this relationship",
      "suggested_actions": ["Specific action 1", "Specific action 2"],
      "due_date": "2024-01-15"
    }
  ]
}`

    // Call DeepSeek AI service with improved error handling
    const aiResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI API error:', aiResponse.status, errorText)
      throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`)
    }

    const aiResult = await aiResponse.json()
    const aiContent = aiResult.choices[0]?.message?.content

    if (!aiContent) {
      console.error('No content received from AI:', aiResult)
      throw new Error('No content received from AI')
    }

    console.log('AI Response:', aiContent)

    // Parse AI response with better error handling
    let recommendations
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : aiContent
      const parsed = JSON.parse(jsonStr)
      recommendations = parsed.recommendations
      
      if (!Array.isArray(recommendations)) {
        throw new Error('Recommendations should be an array')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent, parseError)
      
      // Fallback recommendations if AI parsing fails
      recommendations = [{
        title: "Schedule a check-in",
        description: "Reach out to reconnect and see how they're doing",
        priority: "medium",
        category: "communication",
        estimated_time_minutes: 30,
        reasoning: "Regular communication helps maintain strong relationships",
        suggested_actions: ["Send a message asking how they are", "Suggest meeting for coffee"],
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }]
    }

    // Save recommendations to database with better error handling
    const savedRecommendations = []
    for (const rec of recommendations) {
      try {
        // Calculate due date (7 days from now if not provided)
        const dueDate = rec.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        const { data: savedRec, error: saveError } = await supabaseClient
          .from('recommendations')
          .insert({
            user_id: userId,
            relationship_id: relationshipId,
            title: rec.title || 'Relationship Recommendation',
            description: rec.description || 'AI-generated recommendation',
            priority_level: rec.priority === 'high' ? 4 : rec.priority === 'medium' ? 3 : 2,
            recommendation_type: 'ai_generated',
            suggested_actions: {
              category: rec.category || 'communication',
              effort_level: `${rec.estimated_time_minutes || 30} minutes`,
              how_to_execute: rec.suggested_actions || ['Follow the recommendation'],
              why_appropriate: rec.reasoning || 'AI analysis suggests this action',
              expected_impact: 'Improved relationship quality'
            },
            due_date: dueDate,
            completed: false,
          })
          .select()
          .single()

        if (saveError) {
          console.error('Error saving recommendation:', saveError)
        } else {
          savedRecommendations.push(savedRec)
        }
      } catch (error) {
        console.error('Error processing recommendation:', error)
      }
    }

    console.log(`✅ Generated ${savedRecommendations.length} recommendations for ${relationship.name}`)

    return new Response(
      JSON.stringify({
        success: true,
        recommendations: savedRecommendations,
        relationship: relationship.name,
        count: savedRecommendations.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-recommendations:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Check the function logs for more details'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
