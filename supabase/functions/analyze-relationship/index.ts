
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
    const { relationshipId, userId } = await req.json();
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch relationship data
    const { data: relationship } = await supabaseAdmin
      .from('relationships')
      .select('*')
      .eq('id', relationshipId)
      .single();

    // Fetch recent favors
    const { data: favors } = await supabaseAdmin
      .from('favors')
      .select('*')
      .eq('relationship_id', relationshipId)
      .order('date_occurred', { ascending: false })
      .limit(20);

    const favorsGiven = favors?.filter(f => f.direction === 'given') || [];
    const favorsReceived = favors?.filter(f => f.direction === 'received') || [];

    // Prepare analysis prompt for Deepseek
    const analysisPrompt = `
    Analyze this relationship reciprocity pattern as a relationship psychology expert:
    
    Person: ${relationship.name}
    Relationship Type: ${relationship.relationship_type}
    Importance Level: ${relationship.importance_level}/5
    
    Recent Favors Given (${favorsGiven.length}):
    ${favorsGiven.map(f => `- ${f.category}: ${f.description} (Value: $${f.estimated_value || 'N/A'}, Emotional Weight: ${f.emotional_weight}/5)`).join('\n')}
    
    Recent Favors Received (${favorsReceived.length}):
    ${favorsReceived.map(f => `- ${f.category}: ${f.description} (Value: $${f.estimated_value || 'N/A'}, Emotional Weight: ${f.emotional_weight}/5)`).join('\n')}
    
    Please provide a JSON response with:
    1. balanceScore (1-10 scale)
    2. healthStatus (healthy/needs_attention/concerning)
    3. specificRecommendations (array of 3-5 actionable suggestions)
    4. timingSuggestions (best times to reciprocate)
    5. relationshipInsights (key patterns and observations)
    6. priorityActions (immediate steps to take)
    
    Be empathetic, non-judgmental, and culturally sensitive. Focus on building stronger relationships.
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
            content: 'You are an expert relationship psychologist specializing in reciprocity analysis. Always respond in valid JSON format.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    const aiResponse = await deepseekResponse.json();
    const analysisContent = JSON.parse(aiResponse.choices[0].message.content);

    // Store AI insight in database
    await supabaseAdmin
      .from('ai_insights')
      .insert({
        user_id: userId,
        relationship_id: relationshipId,
        insight_type: 'relationship_analysis',
        content: analysisContent,
        confidence_score: 0.85
      });

    return new Response(JSON.stringify(analysisContent), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in analyze-relationship:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
