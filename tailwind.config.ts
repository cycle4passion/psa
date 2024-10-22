import type { Config } from 'tailwindcss';
import { skeleton } from '@skeletonlabs/tw-plugin';
import { join } from 'path';
export default {
	darkMode: 'selector',
	content: [
		'./src/**/*.{html,svelte}', 
    './node_modules/svelte-ux/**/*.{svelte,js}',
		"./node_modules/layerchart/**/*.{svelte,js}",
		join(require.resolve(
      '@skeletonlabs/skeleton'), 
      '../**/*.{html,js,svelte,ts}'
  )],
	theme: {
		extend: {
      colors: {
        'surface-100': 'rgb(var(--theme-color-surface-100) / <alpha-value>)',
        'surface-200': 'rgb(var(--theme-color-surface-200) / <alpha-value>)',
        'surface-300': 'rgb(var(--theme-color-surface-300) / <alpha-value>)',
        'surface-content': 'rgb(var(--theme-color-surface-content) / <alpha-value>)',
      }
    },
	},
	plugins: [
		skeleton({
			themes: {
				preset: [
					{
						name: 'skeleton',
						enhancements: true
					},
					{
						name: 'wintry',
						enhancements: true
					}
				]
			}
		})
	]
} satisfies Config;
