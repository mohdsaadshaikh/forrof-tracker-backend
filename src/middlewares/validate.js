import ApiError from '../utils/ApiError.js'

export const validate = schema => {
  return (req, res, next) => {
    try {
      if (req.method === 'GET') return next()

      const parsed = schema.parse(req.body)
      req.body = parsed
      next()
    } catch (err) {
      console.error('Validation error:', err.errors)

      throw new ApiError(400, err.errors?.[0]?.message || 'Invalid request data')
    }
  }
}

export default validate
