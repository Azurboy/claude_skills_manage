#!/usr/bin/env node
import { handleCommand } from './index.js';

const args = process.argv.slice(2);

handleCommand(args)
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
