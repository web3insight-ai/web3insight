export interface ResponseResult<T = any> {
  success: boolean
  code: string
  message: string
  data?: T
}

export interface ApiUser {
  id: string
  nick_name?: string
  user_avatar?: string
  user_bio?: string
  user_title?: string
  github_login?: string
  google_email?: string
  user_custom_x?: string
  user_custom_labels?: string[]
  created_at?: string
  updated_at?: string
}

export interface ApiAuthResponse {
  token: string
  user: ApiUser
}

export interface UpdateUserProfileRequest {
  user_nick_name?: string
  user_avatar?: string
  user_bio?: string
  user_title?: string
  user_custom_x?: string
  user_custom_labels?: string[]
}
