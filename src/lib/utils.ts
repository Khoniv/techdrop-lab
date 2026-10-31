/**
 * Minimal class-name joiner, API-compatible with the `cn` helper the
 * Aceternity UI registry components import from "@/lib/utils". This project
 * has no path aliases and no clsx/tailwind-merge; the adapted components
 * only ever join conditional strings, which this covers exactly.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ')
}
