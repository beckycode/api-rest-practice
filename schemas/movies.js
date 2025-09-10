const z = require('zod')

const movieSchema = z.object({
  title: z.string({ required_error: 'Title is required' }),
  year: z
    .number({ required_error: 'Year is required' })
    .int()
    .min(1900)
    .max(new Date().getFullYear()),
  director: z.string({ required_error: 'Director is required' }),
  duration: z
    .number({ required_error: 'Duration is required' })
    .int()
    .positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z
    .string({ required_error: 'Poster is required' })
    .url({ message: 'Poster must be a valid URL' }),
  genre: z.array(z.enum(['action', 'comedy', 'drama', 'horror', 'sci-fi']), {
    required_error: 'Genre is required',
    invalid_type_error: 'Genre must be an array of valid genres',
  }),
})

function validateMovie(data) {
  return movieSchema.safeParse(data)
}

function validatePartialMovie(data) {
  return movieSchema.partial().safeParse(data)
} // For PATCH requests

module.exports = { validateMovie, validatePartialMovie }
