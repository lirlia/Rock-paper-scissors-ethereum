# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

```shell
❯ npx hardhat test


  rsp
    ✓ Should return correct result in all situations (68ms)
    ✓ Can generate
    ✓ Should get token if player have no token
    ✓ Should not get token if player have tokens
player hand: '0 / computer hand: '2' / result: '0'
player hand: '0 / computer hand: '2' / result: '0'
player hand: '0 / computer hand: '1' / result: '1'
player hand: '0 / computer hand: '2' / result: '0'
player hand: '0 / computer hand: '0' / result: '2'
    ✓ Should earn or lost correct tokens (154ms)


  5 passing (1s)
```
