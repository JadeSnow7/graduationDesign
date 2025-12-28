const ACCESS_TOKEN_KEY = 'emf_access_token'
const USER_ROLE_KEY = 'emf_user_role'

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)

export const setAccessToken = (token: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export const clearAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(USER_ROLE_KEY)
}

export const setUserRole = (role: string) => {
  localStorage.setItem(USER_ROLE_KEY, role)
}

export const getUserRole = () => localStorage.getItem(USER_ROLE_KEY)
