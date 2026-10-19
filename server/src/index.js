import { config } from './config.js';
import { openDb } from './db.js';
import { createApp } from './app.js';
import { paymentMode } from './payments.js';

const db = openDb();
const app = createApp(db);
app.listen(config.port, config.host, () => {
  console.log(`${config.brand} running at ${config.publicUrl}  (payments: ${paymentMode()})`);
});
