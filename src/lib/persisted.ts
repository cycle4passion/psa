import { persisted } from 'svelte-persisted-store'

// First param `preferences` is the local storage key.
// Second param is the initial value.
export const prefs = persisted('srhamy', {psa: {
  psa: true,
  psadt: true,
  psavel: true,
  points: true,
  years: -1,
  sort: true
}})