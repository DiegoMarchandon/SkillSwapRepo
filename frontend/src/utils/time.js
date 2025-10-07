import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

const ZONE = 'America/Argentina/Buenos_Aires';

export function toLocal(isoUtc, fmt = 'dd/MM HH:mm') {
  const zoned = toZonedTime(new Date(isoUtc), ZONE);
  return format(zoned, fmt, { locale: es });
}

export function ymdLocal(isoUtc) {
  const zoned = toZonedTime(new Date(isoUtc), ZONE);
  return format(zoned, 'yyyy-MM-dd');
}
