import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const resultsDir = path.join(__dirname, 'results');
const reportPath = path.join(__dirname, 'report.html');

const resultFiles = fs
  .readdirSync(resultsDir)
  .filter((file) => file.endsWith('-result.json'));

if (resultFiles.length === 0) {
  console.error('No result files found.');
  process.exit(1);
}

const mergeResults = resultFiles
  .map((file) => path.join(resultsDir, file))
  .join(' ');

try {
  execSync(`artillery report ${mergeResults} -o ${reportPath}`, {
    stdio: 'inherit',
  });
} catch (error) {
  console.error('Error generating report:', error);
}

console.log(`Report generated at ${reportPath}`);
