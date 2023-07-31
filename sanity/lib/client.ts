import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId, useCdn } from '../env'

export const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn,
  token: "sksh3QsO38b7NW7xqXeVUcOWnOs9MBqkEr8pMaFPKRIJ4SK3BbKMGRE6Iqrale35NB6LB8Myf52gDz5z9rny6q1zP2G8zBOvtG0ewPU93C8UOFF9CVQ5BrJdGlJWhnobR8oFLf4Rwhnjo98MdQQsvGZA47kOSFTSDc27AgEjZWK7MzXNpzH3"
})
