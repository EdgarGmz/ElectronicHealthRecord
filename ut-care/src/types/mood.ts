export type MoodCategory =
  | 'very_common'
  | 'positive'
  | 'common'
  | 'social_load'
  | 'disorientation'
  | 'less_common'
  | 'high_intensity'
  | 'rare'

export interface Mood {
  id: string
  code: string
  name: string
  emoji: string
  category: MoodCategory
  displayOrder: number
}
