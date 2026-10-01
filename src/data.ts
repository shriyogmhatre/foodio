export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: 'shawarma' | 'plates' | 'sides'
  badge?: string
  image: string
}

export type PickupPoint = {
  id: string
  name: string
  address: string
  time: string
  distance: string
  x: number
  y: number
}

export const menu: MenuItem[] = [
  {
    id: 'studio-classic',
    name: 'Studio Classic',
    description: 'Charred chicken, toum, pickled turnip, parsley & crisp fries.',
    price: 189,
    category: 'shawarma',
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'firebird',
    name: 'The Firebird',
    description: 'Spiced chicken, harissa, cabbage, sumac onion & hot honey.',
    price: 219,
    category: 'shawarma',
    badge: 'Hot',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'green-room',
    name: 'Green Room',
    description: 'Crispy falafel, hummus, tomato, mint & sesame tahini.',
    price: 179,
    category: 'shawarma',
    badge: 'Veg',
    image: 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb8?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'chicken-plate',
    name: 'Chicken Artist Plate',
    description: 'Double chicken, saffron rice, fattoush, toum & warm pita.',
    price: 329,
    category: 'plates',
    image: 'https://images.unsplash.com/photo-1633321702518-7feccafb94d5?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'mezze-plate',
    name: 'Mezze Mood',
    description: 'Falafel, hummus, muhammara, tabbouleh, olives & pita.',
    price: 299,
    category: 'plates',
    badge: 'Veg',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'loaded-fries',
    name: 'Sumac Loaded Fries',
    description: 'Crisp fries, toum, chilli oil, sumac onion & feta.',
    price: 149,
    category: 'sides',
    image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=900&q=85',
  },
]

export const defaultPickupPoints: PickupPoint[] = [
  { id: 'koramangala', name: 'Studio Koramangala', address: '80 Feet Road, 4th Block', time: '12 min', distance: '1.2 km', x: 38, y: 31 },
  { id: 'indiranagar', name: 'Indiranagar Window', address: '12th Main, near Metro', time: '18 min', distance: '2.8 km', x: 70, y: 44 },
  { id: 'hsr', name: 'HSR Pickup Bar', address: '27th Main, Sector 2', time: '22 min', distance: '4.1 km', x: 52, y: 72 },
]
