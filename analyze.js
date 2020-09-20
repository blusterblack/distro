const { log } = require('console');

const fs = require('fs').promises;

async function main() {
  const obj = await fs.readFile('test.txt');
  const data = JSON.parse(obj);
  const desktop = {};
  data.forEach((x) => {
    x.Desktop.forEach((y) => {
      if (y in desktop) {
        desktop[y] += 1;
      } else {
        desktop[y] = 1;
      }
    });
  });
  console.log(desktop.sort((x,y)=>));
}
main();
