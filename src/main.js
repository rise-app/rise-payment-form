import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
    // default_channel: process.env.RISE_DEFAULT_CHANNEL || '00000000-0000-0000-0000-000000000000',
    // public_key: process.env.RISE_API_PUBLIC || 'pk_00000000-0000-0000-0000-000000000000'
  },
});

export default app;
