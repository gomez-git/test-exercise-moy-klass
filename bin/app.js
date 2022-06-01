#!/usr/bin/env node

import app from '../server/app.js';

const port = 4000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}.`); // eslint-disable-line no-console
});
