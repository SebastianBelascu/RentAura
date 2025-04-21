type NavLink = {
  href: string;
  label: string;
};

export const links: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/favorites', label: 'favorites' },
  { href: '/bookings', label: 'bookings' },
  { href: '/reviews', label: 'reviews' },
  { href: '/chatbot', label: 'chatbot' },
  { href: '/rentals/create', label: 'create rental' },
  { href: '/rentals', label: 'my rentals' },
  { href: '/reservations', label: 'reservations' },
  { href: '/profile', label: 'profile' },
  { href: '/admin', label: 'admin' },
];
