import { spawnSync } from 'node:child_process';
const result=spawnSync(process.execPath,['node_modules/@playwright/test/cli.js','test','--config','playwright.soft.config.ts',...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,PORTFOLIO_RELEASE:'1'}});
process.exit(result.status??1);
