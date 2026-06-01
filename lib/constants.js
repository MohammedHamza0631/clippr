// Allowed MIME types for profile picture uploads
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// App identity
export const BASE_APP_URL = 'https://clipr.vercel.app/'
export const BASE_APP_DOMAIN = 'clipr.vercel.app'
export const QR_PLACEHOLDER_URL = '/qr-placeholder.png'

// External API endpoints
export const IPINFO_API_BASE = 'https://ipinfo.io/'
export const IPAPI_GEO_URL = 'https://ipapi.co/json'

// Supabase storage buckets
export const BUCKET_QR_CODES = 'qrs'
export const BUCKET_PROFILE_PICS = 'profile_pic'
export const SUPABASE_NO_ROWS_CODE = 'PGRST116'

// Rate limits — (limit, window in seconds)
export const RATE_AUTH_LIMIT = 5
export const RATE_AUTH_WINDOW = 300
export const RATE_GENERAL_LIMIT = 100
export const RATE_GENERAL_WINDOW = 60
export const RATE_URL_CREATE_LIMIT = 10
export const RATE_URL_CREATE_WINDOW = 60
export const RATE_URL_READ_LIMIT = 20
export const RATE_URL_READ_WINDOW = 10
export const RATE_URL_DELETE_LIMIT = 10
export const RATE_URL_DELETE_WINDOW = 60
export const RATE_LIMIT_STORE_TTL_MS = 3_600_000 // 1 hour in-memory store TTL + cleanup interval

// URL generation
export const SHORT_URL_LENGTH = 6

// UI feedback timeouts (ms)
export const FEEDBACK_TIMEOUT_MS = 2000
export const CLICK_REDIRECT_DELAY_MS = 300
export const STORE_CLICK_DELAY_MS = 600

// QR code
export const QR_STYLE = 'dots'
export const QR_EYE_RADIUS = 8
export const QR_SIZE = 180
export const QR_BG_COLOR = '#ffffff'
export const QR_FG_COLOR = '#000000'
export const QR_THUMBNAIL_SIZE = 128
export const QR_DETAIL_SIZE = 256

// Chart colors
export const CHART_COLORS = [
  'hsl(220, 70%, 50%)',
  'hsl(345, 80%, 50%)',
  'hsl(190, 90%, 50%)',
  'hsl(43, 96%, 56%)',
  'hsl(142, 71%, 45%)',
]
export const LOADER_COLOR = '#6366f1'

// Chart layout
export const TOP_CITIES_COUNT = 5
export const PIE_INNER_RADIUS = 60
export const PIE_OUTER_RADIUS = 80
export const PIE_STROKE_WIDTH = 4
export const PIE_PADDING_ANGLE = 2
export const BAR_SIZE = 40
export const BAR_CHART_MARGIN = { top: 20, right: 0, left: 0, bottom: 20 }
