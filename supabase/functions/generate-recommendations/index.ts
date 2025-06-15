
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, relationshipId, context = 'General analysis', language = 'en' } = await req.json();

    if (!userId || !relationshipId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: userId and relationshipId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

    if (!deepseekApiKey) {
      return new Response(
        JSON.stringify({ error: 'DEEPSEEK_API_KEY not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch relationship data
    const { data: relationship, error: relError } = await supabase
      .from('relationships')
      .select('*')
      .eq('id', relationshipId)
      .eq('user_id', userId)
      .single();

    if (relError || !relationship) {
      console.error('Relationship fetch error:', relError);
      return new Response(
        JSON.stringify({ error: 'Relationship not found or access denied' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Fetch favor history
    const { data: favors, error: favorsError } = await supabase
      .from('favors')
      .select('*')
      .eq('relationship_id', relationshipId)
      .eq('user_id', userId)
      .order('date_occurred', { ascending: false })
      .limit(10);

    if (favorsError) {
      console.error('Favors fetch error:', favorsError);
    }

    // Fetch user profile for context
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('personality_type, reciprocity_style')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    // Build analysis context
    const analysisContext = {
      relationship: {
        name: relationship.name,
        type: relationship.relationship_type,
        importance: relationship.importance_level,
        preferences: relationship.preferences || {}
      },
      user: {
        personality: profile?.personality_type || 'balanced',
        reciprocityStyle: profile?.reciprocity_style || 'balanced'
      },
      recentFavors: (favors || []).map(f => ({
        direction: f.direction,
        category: f.category,
        description: f.description,
        date: f.date_occurred,
        emotionalWeight: f.emotional_weight
      })),
      context
    };
    
    const languageInstruction = language === 'id'
        ? 'Provide the response in Indonesian.'
        : 'Provide the response in English.';

    const prompt = `You are an AI relationship advisor specializing in reciprocity and social connections. 

${languageInstruction}

Analyze this relationship and provide personalized recommendations:

Context: ${context}
Relationship: ${analysisContext.relationship.name} (${analysisContext.relationship.type})
Importance Level: ${analysisContext.relationship.importance}/5
User Personality: ${analysisContext.user.personality}
Recent Interactions: ${analysisContext.recentFavors.length} favors recorded

Recent Favor History:
${analysisContext.recentFavors.map(f => `- ${f.direction}: ${f.description} (${f.category}, emotional weight: ${f.emotionalWeight}/5)`).join('\n')}

Provide 2-3 specific, actionable recommendations in this exact JSON format:
{
  "recommendations": [
    {
      "title": "Clear, specific recommendation title",
      "description": "Detailed explanation of what to do and why",
      "category": "communication|favor|milestone|appreciation|connection",
      "effort_level": "low|medium|high",
      "estimated_cost": "Free|$10-25|$25-50|$50+",
      "why_appropriate": "Explanation of why this fits their situation",
      "how_to_execute": "Step-by-step guidance",
      "expected_impact": "What positive outcome to expect",
      "priority": 1
    }
  ],
  "relationship_insights": {
    "balance_assessment": "Assessment of give/take balance",
    "strength_areas": ["area1", "area2"],
    "improvement_areas": ["area1", "area2"],
    "next_interaction_suggestion": "When and how to interact next"
  }
}

Keep recommendations practical, culturally sensitive, and focused on strengthening the relationship through thoughtful reciprocity.`;

    // Call DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('DeepSeek API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI service temporarily unavailable' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 }
      );
    }

    const aiResult = await deepseekResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No content received from AI');
    }

    // Clean and parse AI response
    let cleanContent = aiContent.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsedRecommendations;
    try {
      parsedRecommendations = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', cleanContent);
      
      // Fallback: create basic recommendations
      parsedRecommendations = {
        recommendations: [
          {
            title: `Reconnect with ${relationship.name}`,
            description: 'Based on your interaction history, it would be beneficial to reach out and strengthen this relationship.',
            category: 'communication',
            effort_level: 'low',
            estimated_cost: 'Free',
            why_appropriate: 'Maintaining regular contact strengthens relationships',
            how_to_execute: 'Send a thoughtful message or plan a meetup',
            expected_impact: 'Renewed connection and stronger bond',
            priority: 1
          }
        ],
        relationship_insights: {
          balance_assessment: 'Analysis in progress',
          strength_areas: ['Regular communication'],
          improvement_areas: ['More frequent interaction'],
          next_interaction_suggestion: 'Reach out within the next week'
        }
      };
    }

    // Store recommendations in database
    const recommendationsToStore = parsedRecommendations.recommendations.map((rec: any, index: number) => ({
      user_id: userId,
      relationship_id: relationshipId,
      recommendation_type: 'ai_generated',
      title: rec.title,
      description: rec.description,
      suggested_actions: {
        category: rec.category,
        effort_level: rec.effort_level,
        estimated_cost: rec.estimated_cost,
        why_appropriate: rec.why_appropriate,
        how_to_execute: rec.how_to_execute,
        expected_impact: rec.expected_impact
      },
      priority_level: rec.priority || (index + 1),
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    const { error: insertError } = await supabase
      .from('recommendations')
      .insert(recommendationsToStore);

    if (insertError) {
      console.error('Database insert error:', insertError);
    }

    // Store insights
    if (parsedRecommendations.relationship_insights) {
      const { error: insightError } = await supabase
        .from('ai_insights')
        .insert({
          user_id: userId,
          relationship_id: relationshipId,
          insight_type: 'relationship_analysis',
          content: parsedRecommendations.relationship_insights,
          confidence_score: 0.8
        });

      if (insightError) {
        console.error('Insight insert error:', insightError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        recommendations: parsedRecommendations.recommendations,
        insights: parsedRecommendations.relationship_insights,
        message: 'Recommendations generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-recommendations:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
