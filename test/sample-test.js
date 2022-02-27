const { expect } = require("chai");
const { ethers } = require("hardhat");

let rsp, Rsp;
const ROCK = 0
const PAPER = 1
const SCISSORS = 2

const WIN = 0
const LOSE = 1
const DRAW = 2

let owner, addr1;
let befBalance, aftBalance;

// じゃんけんを実行する関数
async function doGame(hand, eth) {
  return await rsp.connect(addr1).doGame(hand , { value: ethers.utils.parseEther(eth) })
};

beforeEach(async () => {
  [owner, addr1] = await ethers.getSigners();
  Rsp = await ethers.getContractFactory("Rsp");
  rsp = await Rsp.deploy();
  await rsp.deployed();
})

describe("rsp", function() {
  it("Should return double token once player win", async () => {

    befBalance = await rsp.balanceOf(addr1.address);

    // 買った場合は掛け金の2倍が手に入る
    await expect(doGame(SCISSORS, "0.5")).to.emit(rsp, 'ResultNotification').withArgs(WIN, ethers.utils.parseUnits("1.0", "ether"));

    aftBalance = await rsp.balanceOf(addr1.address);
    expect(aftBalance - befBalance).to.equal(ethers.utils.parseUnits("1.0", "ether"));
  })

  it("Should return no token once player lose", async () => {
    await expect(doGame(ROCK, "0.5")).to.emit(rsp, 'ResultNotification').withArgs(LOSE, 0);
  })

  it("Should return no token once player draw", async () => {
    await expect(doGame(PAPER, "0.5")).to.emit(rsp, 'ResultNotification').withArgs(DRAW, 0);
  })
});

// describe("Greeter", function () {
//   it("Should return the new greeting once it's changed", async function () {
//     const Greeter = await ethers.getContractFactory("Greeter");
//     const greeter = await Greeter.deploy("Hello, world!");
//     await greeter.deployed();

//     expect(await greeter.greet()).to.equal("Hello, world!");

//     const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

//     // wait until the transaction is mined
//     await setGreetingTx.wait();

//     expect(await greeter.greet()).to.equal("Hola, mundo!");
//   });
// });
