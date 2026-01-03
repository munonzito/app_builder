// Proxy requests to Expo's Snack API to avoid CORS issues
// Route: /api/expo/snack/{snackId}
export default defineEventHandler(async (event) => {
  const snackId = getRouterParam(event, 'snackId')
  
  if (!snackId) {
    throw createError({ statusCode: 400, message: 'Snack ID is required' })
  }

  const targetUrl = `https://exp.host/--/api/v2/snack/${snackId}`
  
  console.log('[Snack Proxy] Fetching:', targetUrl)

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Snack-Api-Version': '3.0.0',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Snack Proxy] Error response:', errorText)
      throw createError({ 
        statusCode: response.status, 
        message: `Snack API error: ${response.statusText}` 
      })
    }

    const data = await response.json()
    
    return data
  } catch (error: any) {
    console.error('[Snack Proxy] Error:', error.message)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: `Failed to proxy request: ${error.message}` 
    })
  }
})
