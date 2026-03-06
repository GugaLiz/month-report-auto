const TARGET_ORIGIN = 'https://webxsj.worktile.com'

function buildCorsHeaders(requestOrigin, allowedOrigin) {
  const origin = allowedOrigin || requestOrigin || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Accept,x-worktile-cookie',
    'Access-Control-Max-Age': '86400'
  }
}

function jsonResponse(body, status, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders
    }
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const requestOrigin = request.headers.get('Origin')
    const allowedOrigin = env.ALLOWED_ORIGIN || ''
    const corsHeaders = buildCorsHeaders(requestOrigin, allowedOrigin)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      })
    }

    if (url.pathname === '/health') {
      return jsonResponse({ ok: true, service: 'worktile-proxy' }, 200, corsHeaders)
    }

    if (!url.pathname.startsWith('/api/')) {
      return jsonResponse({ error: 'Only /api/* is allowed' }, 404, corsHeaders)
    }

    const targetUrl = `${TARGET_ORIGIN}${url.pathname}${url.search}`

    try {
      const outboundHeaders = new Headers()
      const accept = request.headers.get('Accept')
      const contentType = request.headers.get('Content-Type')
      const cookie = request.headers.get('x-worktile-cookie')

      if (accept) {
        outboundHeaders.set('Accept', accept)
      }
      if (contentType) {
        outboundHeaders.set('Content-Type', contentType)
      }
      if (cookie) {
        outboundHeaders.set('Cookie', cookie)
      }

      const hasBody = !['GET', 'HEAD'].includes(request.method)
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: outboundHeaders,
        body: hasBody ? await request.text() : undefined
      })

      const responseHeaders = new Headers(response.headers)
      Object.entries(corsHeaders).forEach(([key, value]) => {
        responseHeaders.set(key, value)
      })

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      })
    } catch (error) {
      return jsonResponse(
        {
          error: 'Proxy request failed',
          message: error.message || 'Unknown error'
        },
        502,
        corsHeaders
      )
    }
  }
}
