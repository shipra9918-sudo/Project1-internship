/**
 * Where to send the user after login or register, respecting optional deep link.
 */
export function getPostAuthPath(user, fromPath) {
  const role = user?.role;
  const from =
    fromPath && !['/login', '/register'].includes(fromPath) ? fromPath : null;

  if (role === 'admin') {
    if (from && from.startsWith('/admin')) return from;
    return '/admin/dashboard';
  }
  if (role === 'merchant') {
    return from || '/restaurants';
  }
  if (role === 'courier') {
    return from || '/courier/dashboard';
  }
  return from || '/home';
}
