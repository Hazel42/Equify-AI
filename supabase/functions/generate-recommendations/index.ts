
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, relationshipId, context } = await req.json();
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch relationship and recent favors
    const { data: relationship } = await supabaseAdmin
      .from('relationships')
      .select('*')
      .eq('id', relationshipId)
      .single();

    const { data: recentFavors } = await supabaseAdmin
      .from('favors')
      .select('*')
      .eq('relationship_id', relationshipId)
      .order('date_occurred', { ascending: false })
      .limit(10);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const prompt = `
    Generate thoughtful reciprocity suggestions for this situation:
    
    User Profile: ${profile.personality_type || 'Not specified'}
    Context: ${context || 'General reciprocity planning'}
    
    Recipient: ${relationship.name}
    Relationship Type: ${relationship.relationship_type}
    Importance Level: ${relationship.importance_level}/5
    
    Recent Interaction History:
    ${recentFavors?.map(f => `- ${f.direction === 'given' ? 'Gave' : 'Received'}: ${f.description} (${f.category})`).join('\n') || 'No recent interactions'}
    
    Provide a JSON response with:
    1. recommendations: Array of 5 specific reciprocity ideas, each with:
       - title: Brief action title
       - description: What to do
       - category: Type of reciprocity (financial, time, emotional, etc.)
       - effort_level: low/medium/high
       - estimated_cost: rough cost range
       - why_appropriate: Explanation of why this fits
       - how_to_execute: Step-by-step guidance
       - expected_impact: Predicted relationship benefit
    2. timing_advice: Best time to act
    3. cultural_considerations: Any cultural factors to consider
    4. personalization_notes: How to customize based on recipient
    
    Make suggestions that are:
    - Appropriate for the relationship level
    - Proportional to recent interactions
    - Actionable within the next 2 weeks
    - Culturally sensitive
    - Personalized to the recipient
    `;

    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert in social psychology and relationship reciprocity. Always respond in valid JSON format with practical, culturally sensitive advice.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 1200
      }),
    });

    const aiResponse = await deepseekResponse.json();
    const recommendationsContent = JSON.parse(aiResponse.choices[0].message.content);

    // Store recommendations in database
    for (const rec of recommendationsContent.recommendations) {
      await supabaseAdmin
        .from('recommendations')
        .insert({
          user_id: userId,
          relationship_id: relationshipId,
          recommendation_type: 'reciprocity_suggestion',
          title: rec.title,
          description: rec.description,
          suggested_actions: rec,
          priority_level: rec.effort_level === 'low' ? 1 : rec.effort_level === 'medium' ? 3 : 5,
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 weeks from now
        });
    }

    return new Response(JSON.stringify(recommendationsContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in generate-recommendations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
