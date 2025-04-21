
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const MAPBOX_TOKEN = Deno.env.get('MAPBOX_TOKEN')
    
    if (!MAPBOX_TOKEN) {
      console.error('Mapbox token not configured in environment variables')
      return new Response(
        JSON.stringify({ error: 'Mapbox token not configured' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Check if this is a geocoding request
    let body = {}
    try {
      if (req.body) {
        body = await req.json()
      }
    } catch (e) {
      // If body parsing fails, continue with just the token
      console.log('No body or invalid JSON in request')
    }
    
    // If address is provided, geocode it
    if (body && body.address) {
      const address = body.address
      const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}`
      
      try {
        const response = await fetch(geocodeUrl)
        const data = await response.json()
        
        return new Response(
          JSON.stringify({ 
            token: MAPBOX_TOKEN,
            geocoding: data.features?.[0]?.center || null 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      } catch (geocodeError) {
        console.error('Error geocoding address:', geocodeError)
        return new Response(
          JSON.stringify({ 
            token: MAPBOX_TOKEN,
            error: 'Failed to geocode address'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200, // Still return 200 to provide the token
          }
        )
      }
    }
    
    // Return just the token if no address provided
    return new Response(
      JSON.stringify({ token: MAPBOX_TOKEN }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in get-mapbox-token function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
