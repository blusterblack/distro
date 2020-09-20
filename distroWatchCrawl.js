const axios = require('axios');
const cheerio = require('cheerio');
const { log } = require('console');
const fs = require('fs').promises;

const testURL = 'https://distrowatch.com/table.php?distribution=debian';

function getDistroInfo(htmlString) {
  try {
    const $ = cheerio.load(htmlString);
    const data = {
      Name: $('td.TablesTitle>h1').text(),
      Rating: $('td.TablesTitle>b:nth-of-type(8)').text(),
      Review: $('td.TablesTitle>b:nth-of-type(9)').text(),
    };

    $('td.TablesTitle>ul>li').each((index, element) => {
      const [key, val] = $(element).text().split(': ');
      if (key === 'Popularity') {
        data[key] = [val.trim().match(/(?<=\().*\d/)[0].replace(',', '')];
      } else {
        data[key] = val.trim().split(', ');
      }
    });

    data.Description = [$('td.TablesTitle').children().remove().end()
      .text()
      .trim()
      .match(/^.*(?=\w*\n)/g)[0]];

    return data;
  } catch (err) {
    return null;
  }
}
async function getDistroInfoFromURL(url) {
  try {
    const res = await axios.get(url);
    const data = getDistroInfo(res.data);
    return Promise.resolve(data);
  } catch (err) {
    return Promise.reject(Error(err));
  }
}

async function getAllDistroName() {
  try {
    const res = await axios.get('https://distrowatch.com/search.php?status=All');
    const $ = cheerio.load(res.data);
    const urls = [];

    $('td.NewsText>b>a')
      .each((index, element) => {
        urls.push($(element).attr('href'));
      });

    return Promise.resolve(urls.slice(1));
  } catch (err) {
    return Promise.reject(Error(err));
  }
}

async function main() {
  const names = await getAllDistroName();
  const baseURL = 'https://distrowatch.com/table.php?distribution=';
  const distros = [];
  let num = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const name of names) {
    const distro = await getDistroInfoFromURL(baseURL + name);
    if (distro !== null) {
      console.log(num++);
      distros.push(distro);
    }
  }
  console.log(num);
  try {
    await fs.writeFile('test.txt', JSON.stringify(distros));
  } catch (err) {
    console.log(err);
  }
}
// getDistroInfo(testURL);
main();
