#!/usr/bin/env node

import app from '../server/app.js';

const port = 4000;

app.listen(port, () => {
  console.log(`Server up on http://localhost:${port}`); // eslint-disable-line no-console
});
