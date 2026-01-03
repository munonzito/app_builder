export class ApiException extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ApiException'
  }
}

export function useApi() {
  const getHeaders = (): Record<string, string> => {
    return {
      'Content-Type': 'application/json',
    }
  }

  const handleResponse = async (response: Response): Promise<any> => {
    if (response.ok) {
      const text = await response.text()
      if (!text) {
        return { success: true }
      }
      return JSON.parse(text)
    }
    const errorText = await response.text()
    throw new ApiException(response.status, errorText)
  }

  const get = async (endpoint: string): Promise<any> => {
    const response = await fetch(`/api${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    })
    return handleResponse(response)
  }

  const post = async (endpoint: string, body: Record<string, any>): Promise<any> => {
    const response = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return handleResponse(response)
  }

  const put = async (endpoint: string, body: Record<string, any>): Promise<any> => {
    const response = await fetch(`/api${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    })
    return handleResponse(response)
  }

  const del = async (endpoint: string): Promise<any> => {
    const response = await fetch(`/api${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    })
    return handleResponse(response)
  }

  return {
    get,
    post,
    put,
    delete: del,
    getHeaders,
  }
}
