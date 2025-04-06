import { createApp } from './app.js';
import { Sessions } from './sessions.js';

const main = () => {
  const app = createApp(new Sessions());
  const port = Deno.env.get('PORT') || 3000;
  Deno.serve({ port }, app.fetch);
};

main();
