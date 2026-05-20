export function formatDateTime(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const min = String(d.getMinutes()).padStart(2, '0');
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
  const hh12 = String(d.getHours() % 12 || 12).padStart(2, '0');
  return `${dd}-${mm}-${yyyy} ${hh12}:${min} ${ampm}`;
}

export function nowDateTimeLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toDisplayDateTime(isoOrLocal: string): string {
  if (!isoOrLocal) return '';
  const d = new Date(isoOrLocal);
  if (isNaN(d.getTime())) return isoOrLocal;
  return formatDateTime(d);
}

export function generateBillNo(lastNo?: string): string {
  const num = lastNo ? parseInt(lastNo.replace(/\D/g, ''), 10) + 1 : 10001;
  return String(num);
}

export function getIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  );
}