// Proxy requests to Expo's Snackager CDN to avoid CORS/403 issues
// Route: /api/snackager/{path}
export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')
  
  if (!path) {
    throw createError({ statusCode: 400, message: 'Path is required' })
  }

  const targetUrl = `https://d37p21p3n8r8ug.cloudfront.net/${path}`
  
  console.log('[Snackager Proxy] Fetching:', targetUrl)

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Referer': 'https://snack.expo.dev/',
        'Origin': 'https://snack.expo.dev',
      },
    })

    if (!response.ok) {
      console.error('[Snackager Proxy] Error:', response.status, response.statusText)
      throw createError({ 
        statusCode: response.status, 
        message: `Snackager error: ${response.statusText}` 
      })
    }

    const contentType = response.headers.get('content-type') || 'application/javascript'
    const body = await response.text()
    
    // Set appropriate headers
    setResponseHeaders(event, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
    })

    return body
  } catch (error: any) {
    console.error('[Snackager Proxy] Error:', error.message)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: `Failed to proxy request: ${error.message}` 
    })
  }
})
