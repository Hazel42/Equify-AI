
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

    console.log(`🤖 Starting AI analysis for relationship ${relationshipId} in ${language}`)

    // Get relationship details
    const { data: relationship, error: relError } = await supabaseClient
      .from('relationships')
      .select('*')
      .eq('id', relationshipId)
      .eq('user_id', userId)
      .single()

    if (relError || !relationship) {
      throw new Error(`Relationship not found: ${relError?.message}`)
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

    // Determine language for AI prompt
    const isIndonesian = language === 'id'
    const systemPrompt = isIndonesian ? 
      `Anda adalah AI ahli hubungan yang membantu pengguna membangun koneksi yang seimbang dan bermakna. Berikan rekomendasi dalam Bahasa Indonesia yang natural dan mudah dipahami.` :
      `You are a relationship expert AI that helps users build balanced, meaningful connections. Provide recommendations in natural, easy-to-understand English.`

    const userPrompt = isIndonesian ?
      `Analisis hubungan ini dan berikan rekomendasi:

Nama: ${relationship.name}
Jenis Hubungan: ${relationship.relationship_type}
Tingkat Kepentingan: ${relationship.importance_level}/5
Favor yang Diberikan: ${givenCount}
Favor yang Diterima: ${receivedCount}
Keseimbangan: ${balance > 0 ? `+${balance} (lebih banyak memberi)` : balance < 0 ? `${balance} (lebih banyak menerima)` : 'seimbang'}

Favor Terbaru:
${recentFavors.slice(0, 5).map(f => `- ${f.direction === 'given' ? 'Memberi' : 'Menerima'}: ${f.description} (${f.category})`).join('\n')}

${context ? `Konteks Tambahan: ${context}` : ''}

Berikan 1-3 rekomendasi spesifik dan dapat ditindaklanjuti untuk memperkuat hubungan ini. Format respons sebagai JSON:
{
  "recommendations": [
    {
      "title": "Judul rekomendasi",
      "description": "Deskripsi detail dalam bahasa Indonesia",
      "priority": "high|medium|low",
      "category": "communication|favor|emotional_support|quality_time",
      "estimated_time_minutes": number,
      "reasoning": "Alasan mengapa rekomendasi ini penting",
      "suggested_actions": ["Aksi 1", "Aksi 2"],
      "due_date": "YYYY-MM-DD"
    }
  ]
}` :
      `Analyze this relationship and provide recommendations:

Name: ${relationship.name}
Relationship Type: ${relationship.relationship_type}
Importance Level: ${relationship.importance_level}/5
Favors Given: ${givenCount}
Favors Received: ${receivedCount}
Balance: ${balance > 0 ? `+${balance} (giving more)` : balance < 0 ? `${balance} (receiving more)` : 'balanced'}

Recent Favors:
${recentFavors.slice(0, 5).map(f => `- ${f.direction === 'given' ? 'Gave' : 'Received'}: ${f.description} (${f.category})`).join('\n')}

${context ? `Additional Context: ${context}` : ''}

Provide 1-3 specific, actionable recommendations to strengthen this relationship. Format response as JSON:
{
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed description in English",
      "priority": "high|medium|low",
      "category": "communication|favor|emotional_support|quality_time",
      "estimated_time_minutes": number,
      "reasoning": "Why this recommendation is important",
      "suggested_actions": ["Action 1", "Action 2"],
      "due_date": "YYYY-MM-DD"
    }
  ]
}`

    // Call AI service
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
      throw new Error(`AI API error: ${aiResponse.status} ${aiResponse.statusText}`)
    }

    const aiResult = await aiResponse.json()
    const aiContent = aiResult.choices[0]?.message?.content

    if (!aiContent) {
      throw new Error('No content received from AI')
    }

    // Parse AI response
    let recommendations
    try {
      const parsed = JSON.parse(aiContent)
      recommendations = parsed.recommendations
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent)
      throw new Error('Failed to parse AI recommendations')
    }

    // Save recommendations to database
    const savedRecommendations = []
    for (const rec of recommendations) {
      const { data: savedRec, error: saveError } = await supabaseClient
        .from('ai_recommendations')
        .insert({
          user_id: userId,
          relationship_id: relationshipId,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          category: rec.category,
          estimated_time_minutes: rec.estimated_time_minutes,
          reasoning: rec.reasoning,
          suggested_actions: rec.suggested_actions,
          due_date: rec.due_date,
          status: 'pending',
          ai_model: 'deepseek-chat',
          context: context || null,
        })
        .select()
        .single()

      if (saveError) {
        console.error('Error saving recommendation:', saveError)
      } else {
        savedRecommendations.push(savedRec)
      }
    }

    console.log(`✅ Generated ${savedRecommendations.length} recommendations for ${relationship.name}`)

    return new Response(
      JSON.stringify({
        success: true,
        recommendations: savedRecommendations,
        relationship: relationship.name,
        language: language
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-recommendations:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
