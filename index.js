#!/usr/bin/env node

const [,, command] = process.argv;

switch (command) {
  case 'generate-config':
    require('./generateConfig');
    break;
  case 'start-tool':
    require('./startTool');
    break;
  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
