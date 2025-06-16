
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  userId: string;
  relationships: any[];
  favors: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, relationships, favors }: RequestBody = await req.json()
    
    console.log(`🧠 Generating AI insights for user ${userId}`)

    // Calculate relationship metrics
    const totalRelationships = relationships.length
    const avgImportance = relationships.reduce((sum, rel) => sum + (rel.importance_level || 3), 0) / totalRelationships
    
    // Analyze favor patterns
    const givenFavors = favors.filter(f => f.direction === 'given')
    const receivedFavors = favors.filter(f => f.direction === 'received')
    const overallBalance = givenFavors.length - receivedFavors.length

    // Calculate individual relationship health scores
    const relationshipHealth = relationships.map(rel => {
      const relFavors = favors.filter(f => f.relationship_id === rel.id)
      const given = relFavors.filter(f => f.direction === 'given').length
      const received = relFavors.filter(f => f.direction === 'received').length
      const balance = given - received
      const activity = relFavors.length
      
      // Health score algorithm (0-100)
      let score = 50 // Base score
      
      // Balance factor (±20 points)
      if (balance === 0) score += 20 // Perfect balance
      else if (Math.abs(balance) <= 2) score += 10 // Good balance
      else if (balance < -3) score -= 15 // Receiving too much
      else if (balance > 3) score -= 10 // Giving too much
      
      // Activity factor (±15 points)
      if (activity >= 10) score += 15
      else if (activity >= 5) score += 10
      else if (activity >= 3) score += 5
      else if (activity === 0) score -= 20
      
      // Importance factor (±15 points)
      score += (rel.importance_level - 3) * 5
      
      return {
        relationshipId: rel.id,
        name: rel.name,
        score: Math.max(0, Math.min(100, score)),
        balance,
        activity
      }
    })

    // Calculate overall health score
    const overallHealthScore = relationshipHealth.length > 0 
      ? relationshipHealth.reduce((sum, rel) => sum + rel.score, 0) / relationshipHealth.length
      : 0

    // Generate AI insights
    const insights = []

    // Health score insights
    const topRelationships = relationshipHealth.sort((a, b) => b.score - a.score).slice(0, 3)
    const bottomRelationships = relationshipHealth.sort((a, b) => a.score - b.score).slice(0, 3)

    if (topRelationships.length > 0) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'health_score',
        title: 'Your Strongest Relationships',
        description: `${topRelationships[0].name} (${topRelationships[0].score.toFixed(0)}%) is your healthiest relationship. Keep nurturing these strong connections.`,
        score: topRelationships[0].score / 10,
        confidence: 85,
        priority: 'low',
        actionable: false,
        relationshipId: topRelationships[0].relationshipId,
        relationshipName: topRelationships[0].name
      })
    }

    if (bottomRelationships.length > 0 && bottomRelationships[0].score < 60) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'prediction',
        title: 'Relationship Needs Attention',
        description: `${bottomRelationships[0].name} (${bottomRelationships[0].score.toFixed(0)}%) may need more attention. Consider reaching out soon.`,
        score: bottomRelationships[0].score / 10,
        confidence: 78,
        priority: bottomRelationships[0].score < 40 ? 'high' : 'medium',
        actionable: true,
        relationshipId: bottomRelationships[0].relationshipId,
        relationshipName: bottomRelationships[0].name
      })
    }

    // Balance insights
    if (overallBalance < -5) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'trend',
        title: 'Receiving More Than Giving',
        description: 'You\'ve received significantly more favors than given. Consider looking for opportunities to help others.',
        confidence: 82,
        priority: 'medium',
        actionable: true
      })
    } else if (overallBalance > 5) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'trend',
        title: 'Very Generous Pattern',
        description: 'You give more than you receive. Make sure you\'re also comfortable asking for help when needed.',
        confidence: 80,
        priority: 'low',
        actionable: true
      })
    }

    // Activity patterns
    const recentActivity = favors.filter(f => {
      const favorDate = new Date(f.date_occurred)
      const lastWeek = new Date()
      lastWeek.setDate(lastWeek.getDate() - 7)
      return favorDate >= lastWeek
    }).length

    if (recentActivity === 0 && totalRelationships > 0) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'pattern',
        title: 'Low Recent Activity',
        description: 'No relationship activities in the past week. Consider reaching out to someone you care about.',
        confidence: 75,
        priority: 'medium',
        actionable: true
      })
    }

    // Goal-based insights
    if (totalRelationships < 3) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'goal',
        title: 'Expand Your Network',
        description: 'Having more diverse relationships can enrich your life. Consider adding 2-3 more meaningful connections.',
        confidence: 70,
        priority: 'low',
        actionable: true
      })
    }

    console.log(`✅ Generated ${insights.length} AI insights`)

    return new Response(
      JSON.stringify({
        success: true,
        insights,
        overallHealthScore,
        metrics: {
          totalRelationships,
          avgImportance,
          overallBalance,
          recentActivity
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-ai-insights:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        insights: [],
        overallHealthScore: 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
