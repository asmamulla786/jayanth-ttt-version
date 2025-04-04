import { createApp } from './app.js';

const main = () => {
  const app = createApp();
  const port = Deno.env.get('PORT') || 3000;
  Deno.serve({ port }, app.fetch);
};

main();
