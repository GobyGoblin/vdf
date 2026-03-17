import { QuoteRequest } from './server/models/index.js';

async function check() {
  try {
    const desc = await QuoteRequest.describe();
    console.log(JSON.stringify(desc, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
