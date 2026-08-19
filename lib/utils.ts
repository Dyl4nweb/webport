type ClassValue = string | number | null | undefined | boolean | ClassValue[];

function flattenClasses(values: ClassValue[], out: (string | number)[] = []): (string | number)[] {
  for (const value of values) {
    if (Array.isArray(value)) {
      flattenClasses(value, out);
    } else if (value && (typeof value === 'string' || typeof value === 'number')) {
      out.push(value);
    }
  }
  return out;
}

export function cn(...inputs: ClassValue[]): string {
  return flattenClasses(inputs)
    .join(" ")
    .trim()
    .replace(/\s+/g, " ");
}

export function formatRange(start: string, end: string): string {
  return `${start} — ${end}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}