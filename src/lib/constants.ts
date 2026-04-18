export const APP_NAME = 'Juline AI Nail Studio'
export const APP_URL = 'https://juline-nail-studio.vercel.app'

export const MAX_FREE_DESIGNS = 3
export const FREE_COUNT_KEY = 'juline-free-count'

export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'היכרות',
    credits: 5,
    price: 29,
    priceFormatted: '₪29',
    perCredit: '₪5.80 להדמיה',
    popular: false,
  },
  {
    id: 'studio',
    name: 'סטודיו',
    credits: 15,
    price: 59,
    priceFormatted: '₪59',
    perCredit: '₪3.93 להדמיה',
    popular: true,
  },
  {
    id: 'pro',
    name: 'פרו',
    credits: 35,
    price: 99,
    priceFormatted: '₪99',
    perCredit: '₪2.83 להדמיה',
    popular: false,
  },
] as const

export type PackageId = typeof CREDIT_PACKAGES[number]['id']
