export function bs(amount: number): string {
  const negative = amount < 0;
  const cents = Math.round(Math.abs(amount) * 100);
  const units = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, '0');
  const grouped = String(units).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${negative ? '-' : ''}Bs ${grouped},${fraction}`;
}

export function codeOf(slug: string): string {
  return slug.toUpperCase();
}

export function slugOfCode(code: string): string {
  return code.toLowerCase();
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function hhmm(iso: string): string {
  return iso.slice(11, 16);
}

export function fecha(iso: string): string {
  const day = Number(iso.slice(8, 10));
  const month = MONTHS[Number(iso.slice(5, 7)) - 1];

  return `${day} ${month}`;
}

export function fechaHora(iso: string): string {
  return `${fecha(iso)} · ${hhmm(iso)}`;
}

export function porcentaje(value: number): string {
  return `${value} %`;
}

export function minutos(count: number): string {
  return `${count} min`;
}

export function restante(minutesLeft: number): string {
  if (minutesLeft <= 0) {
    return 'Debería estar llegando';
  }

  if (minutesLeft < 60) {
    return `Faltan ${minutesLeft} min`;
  }

  const hours = Math.floor(minutesLeft / 60);
  const rest = minutesLeft % 60;

  return rest === 0 ? `Faltan ${hours} h` : `Faltan ${hours} h ${rest} min`;
}
