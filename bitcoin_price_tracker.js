// Install the required packages before running:
// npm install node-fetch@2 blessed blessed-contrib

const fetch = require('node-fetch');
const blessed = require('blessed');
const contrib = require('blessed-contrib');

let prices = [];

const screen = blessed.screen();
const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

const line = grid.set(0, 0, 8, 12, contrib.line, {
  style: {
    line: 'yellow',
    text: 'green',
    baseLine: 'black',
  },
  minY: 0,
  maxY: 0,
  label: 'Bitcoin Price (USD)',
});

const priceBox = grid.set(8, 0, 4, 12, blessed.box, {
  content: 'Fetching price...',
  tags: true,
  align: 'center',
  yalign: 'middle',
  style: {
    fg: 'white',
    bg: 'black',
  }
});

function fetchPrice() {
  fetch('https://api.coindesk.com/v1/bpi/currentprice/BTC.json')
  .then((res) => res.json())
  .then((data) => {
    const price = parseFloat(data.bpi.USD.rate.replace(/,/g, ''));
    prices.push(price);
    if (prices.length > 30) prices.shift(); // Keep only 30 prices

    // Update minY and maxY for chart scaling
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    line.options.minY = minPrice * 0.99;
    line.options.maxY = maxPrice * 1.01;

    // Update the line chart
    const lineData = {
      title: 'BTC',
      x: prices.map((_, i) => i.toString()),
      y: prices,
      style: { line: 'yellow' },
    };
    line.setData([lineData]);

    // Determine color based on price change
    const previousPrice = prices[prices.length - 2] || price;
    const color = price >= previousPrice ? 'green' : 'red';

    // Update the price box with color coding
    priceBox.setContent(
      `{bold}Current Price:{/} {${color}-fg}$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}{/}`
    );
    screen.render();
  })
  .catch((err) => {
    priceBox.setContent('{red-fg}Error fetching price.{/}');
    console.error(err);
    screen.render();
  });
}

fetchPrice(); // Initial fetch
setInterval(fetchPrice, 5000); // Update every 5s

screen.key(['escape', 'q', 'C-c'], () => process.exit(0));
