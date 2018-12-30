interface ResponseError extends Error {
  response: Response
}

export function checkStatus(response: Response): Response {
  if (response.status >= 200 && response.status < 300) {
    return response
  }

  const error: Error = new Error(response.statusText)
  const errorResponse = { response: response }
  const returnErrorResponse: ResponseError = { ...error, ...errorResponse }
  throw returnErrorResponse
}

export const parseJSON = (response: Response) => response.json()
