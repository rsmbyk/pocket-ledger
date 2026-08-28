import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'dist',
			assets: 'dist',
			fallback: '200.html',
			precompress: false,
			strict: true
		}),
		files: {
			assets: 'public'
		},
		prerender: {
			handleMissingId: 'ignore'
		}
	}
};

export default config;
