export function normalizarRol(rol) {
  const valor = String(rol || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

  if (['ADMIN', 'ADMINISTRADOR', 'ADMINISTRATIVE'].includes(valor)) return 'ADMINISTRADOR';
  if (['TECNICO', 'TECHNICIAN', 'TECH'].includes(valor)) return 'TECNICO';
  if (['CLIENTE', 'USUARIO', 'USER'].includes(valor)) return 'CLIENTE';
  return valor;
}

export function obtenerRolSesion(sesion) {
  return normalizarRol(sesion?.rol || sesion?.usuario?.rol || sesion?.user?.rol);
}
