/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: 'hsl(210, 100%, 30%)', // Biru korporat yang kuat
					hover: 'hsl(210, 100%, 25%)',
					focus: 'hsl(210, 100%, 40%)'
				},
				secondary: {
					DEFAULT: 'hsl(210, 10%, 95%)',
					hover: 'hsl(210, 10%, 90%)'
				},
				destructive: {
					DEFAULT: 'hsl(0, 72%, 51%)',
					hover: 'hsl(0, 72%, 46%)'
				},
				calm: 'hsl(125, 67%, 35%)', // Untuk Empathic Interface
				text: 'hsl(210, 10%, 15%)',
				background: 'hsl(0, 0%, 100%)'
			},
			fontFamily: {
				sans: [
					'Inter',
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
					'Roboto',
					'Helvetica',
					'Arial',
					'sans-serif'
				],
				serif: ['"Merriweather"', 'Georgia', 'serif']
			}
		}
	},
	plugins: []
};