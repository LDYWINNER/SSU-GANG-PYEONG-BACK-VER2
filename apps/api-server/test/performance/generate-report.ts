import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const resultsDir = path.join(__dirname, 'results');

const resultFiles = fs
  .readdirSync(resultsDir)
  .filter((file) => file.endsWith('-result.json'));

if (resultFiles.length === 0) {
  console.error('No result files found.');
  process.exit(1);
}

resultFiles.forEach((file) => {
  const filePath = path.join(resultsDir, file);
  const reportPath = path.join(
    resultsDir,
    `${path.basename(file, '.json')}.html`,
  );

  try {
    execSync(`artillery report ${filePath} -o ${reportPath}`, {
      stdio: 'inherit',
    });
    console.log(`Report generated at ${reportPath}`);
  } catch (error) {
    console.error('Error generating report for file:', file, error);
  }
});
