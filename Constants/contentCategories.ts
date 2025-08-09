// Content categories for YouTube and Netflix
export const YOUTUBE_CATEGORIES = [
  'Entertainment',
  'Education',
  'Gaming',
  'Commentary & Opinion',
  'Music & Audio',
  'Film & TV',
  'Vlogs & Lifestyle',
  'Health & Fitness',
  'Food & Cooking',
  'Beauty & Fashion',
  'Science & Technology',
  'Travel & Adventure',
  'DIY & Crafts',
  'Home & Family',
  'Business & Finance',
  'Motivation & Self-Improvement',
  'Career & Skill Development',
  'Spirituality & Philosophy',
  'Reviews & Unboxings',
  'Live Streams & Podcasts'
];

export const NETFLIX_CATEGORIES = [
  'Drama',
  'Comedy',
  'Action & Adventure',
  'Thriller & Suspense',
  'Horror',
  'Romance',
  'Sci-Fi & Fantasy',
  'Crime & Mystery',
  'Documentary',
  'Biography & True Story',
  'Family & Kids',
  'Teen & Young Adult',
  'Animation & Anime',
  'Reality & Unscripted',
  'Talk Shows & Stand-up Comedy',
  'Historical & Period Pieces',
  'Musical & Music-Based',
  'International & World Cinema',
  'Sports & Fitness',
  'Short Films & Anthologies'
];

export const CONTENT_TYPES = ['YouTube', 'Netflix'] as const;
export type ContentType = typeof CONTENT_TYPES[number];