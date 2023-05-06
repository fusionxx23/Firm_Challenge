import { expect } from 'chai';

const moneyConverter = (n: number, curr: string) => {
  switch (curr) {
    case "USDC":
      n = n * 1
      break;
    case "ETH":
      n = n * 1800
      break;
    case "WBTC":
      n = n * 25000
      break;
    case "EUROC":
      n = n * 1.1
      break;
  }

  return n;
}

let e4 = 1e4
let e5 = 1e5
const calculateScore = (events: string[]): number => {
  let points = 0;
  let bal = 0;
  let totalSent = 0;
  let totalReceived = 0;
  let madeToMillion = false;

  for (let i in events) {
    const event = events[i];
    const [curr, amt] = event.split('(')[1].split(')')[0].split(',')
    const invoice = moneyConverter(parseFloat(amt), curr);
    if (event.includes('Received')) {
      totalReceived += invoice;
      bal += invoice;
    } else if (event.includes('Sent')) {
      totalSent += invoice;
      bal -= invoice;
    }
    if (bal >= e5 * 10 && !madeToMillion) { // Check if company's balance has >= a million 
      points += 4;
      madeToMillion = true;
    }
  }

  // Recieve Calcs
  let receivedPoints = 0;
  if (totalReceived >= e4) receivedPoints += 3;
  if (totalReceived >= e5) receivedPoints += 6;
  if (events.filter(event => event.includes('Received')).length >= 10)
    receivedPoints += 3;
  if (receivedPoints > 10)
    points += 10
  else
    points += receivedPoints > 0 ? receivedPoints : 0

  // Sent Calcs
  let sentPoints = 0;
  if (totalSent > e4) sentPoints += 3;
  if (totalSent > e5) sentPoints += 6;
  const s = events.filter(event => event.includes('Sent')).length / 5;
  if (s >= 1) {
    sentPoints += parseInt(s.toString())
  }
  if (sentPoints > 10) points += 10
  else points += sentPoints;
  // BALANCE CALCS 
  const p = bal / e5
  const c = p > 6 ?
    6 :
    p > 1 ? p : 0;
  points += parseInt(c.toString()); // Make sure points has no decimals 
  if (bal >= e4) points += 2;
  return points;
}

describe('Airdrop score calculator', () => {
  context('with some activity for several companies', () => {
    it('calculates case 1', () => {
      expect(calculateScore([
        'Received(ETH, 1)',
        'Received(USDC, 10000)',
        'Received(USDC, 1000000)',
        'Sent(ETH, 0.1)'
      ])).to.eq(21);
    });

    it('calculates case 2', () => {
      expect(calculateScore([
        'Received(USDC, 1000)',
        'Sent(USDC, 0.1)',
        'Sent(USDC, 0.2)',
        'Sent(USDC, 0.3)',
        'Sent(USDC, 0.4)',
        'Sent(USDC, 1.1)',
        'Sent(USDC, 0.3)',
        'Sent(USDC, 0.4)',
        'Sent(USDC, 1.1)',
        'Sent(USDC, 0.3)',
        'Sent(USDC, 0.4)',
        'Sent(USDC, 1.1)',
      ])).to.eq(2);
    });

    it('calculates case 3', () => {
      expect(calculateScore([
        'Received(WBTC, 10)',
        'Received(USDC, 150000)',
        'Sent(USDC, 10000)',
        'Sent(USDC, 10000)',
        'Sent(USDC, 10000)',
        'Sent(USDC, 10000)',
        'Sent(WBTC, 4)',
        'Sent(USDC, 10000)',
        'Sent(USDC, 10000)',
        'Sent(USDC, 10000)',
        'Sent(USDC, 10000)',
        'Sent(USDC, 10000)',
        'Sent(USDC, 50000)',
      ])).to.eq(22);
    });

    it('calculates case 4', () => {
      expect(calculateScore([
        'Received(USDC, 1000)',
        'Received(USDC, 1000)',
        'Received(USDC, 1000)',
        'Received(WBTC, 0.1)',
        'Received(WBTC, 0.2)',
        'Sent(USDC, 5000)',
        'Received(USDC, 1000)',
        'Received(USDC, 1000)',
        'Received(USDC, 1000)',
        'Sent(WBTC, 0.1)',
        'Sent(WBTC, 0.2)',
        'Sent(USDC, 5000)',
        'Received(USDC, 100000)',
        'Sent(USDC, 100000)',
      ])).to.eq(19);
    });

    it('calculates case 5', () => {
      expect(calculateScore([
        'Received(USDC, 10000)',
        'Received(USDC, 10000)',
        'Received(USDC, 10000)',
        'Received(USDC, 10000)',
        'Received(USDC, 10000)',
        'Received(USDC, 10000)',
        'Received(USDC, 10000)',
        'Received(USDC, 10000)',
        'Received(USDC, 10000)',
        'Received(USDC, 10000)',
        'Received(WBTC, 5)',
        'Received(ETH, 1000)',
        'Sent(USDC, 500)',
        'Sent(USDC, 500)',
        'Sent(USDC, 500)',
        'Sent(USDC, 500)',
        'Sent(USDC, 500)',
        'Sent(USDC, 500)',
        'Sent(USDC, 500)',
        'Sent(USDC, 500)',
        'Sent(USDC, 500)',
        'Sent(USDC, 500)',
        'Sent(ETH, 500)',
      ])).to.eq(32);
    });
  });
});