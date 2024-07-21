import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const directories = ['board', 'course', 'table', 'todo', 'user'];
const resultsDir = path.join(__dirname, 'results');

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir);
}

directories.forEach((dir) => {
  const testFiles = fs.readdirSync(path.join(__dirname, dir));
  testFiles.forEach((file) => {
    const filePath = path.join(__dirname, dir, file);
    const resultPath = path.join(
      resultsDir,
      `${file.replace('.yaml', '')}-result.json`,
    );
    console.log(`Running ${filePath}`);
    try {
      execSync(`artillery run ${filePath} -o ${resultPath}`, {
        stdio: 'inherit',
      });
    } catch (error) {
      console.error(`Error running ${filePath}:`, error);
    }
  });
});

console.log('All tests completed.');
