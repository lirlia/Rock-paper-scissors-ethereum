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
let befBalance, aftBalance, score;

// じゃんけんを実行する関数
async function doGame(hand, eth) {
  return await rsp.connect(addr1).doGame(hand , { value: ethers.utils.parseEther(eth) })
};

function convertEth(eth) {
  return ethers.utils.parseUnits(eth, "ether")
}

beforeEach(async () => {
  [owner, addr1] = await ethers.getSigners();
  Rsp = await ethers.getContractFactory("Rsp");
  rsp = await Rsp.deploy();
  await rsp.deployed();
})

describe("rsp", function() {
  it("Should return double token once player win", async () => {

    // トークンの Mint
    await rsp.connect(addr1).getToken();

    // 保持トークン量が 1 ETH か？
    befBalance = await rsp.balanceOf(addr1.address);
    expect(befBalance).equal(convertEth("1.0"));

    // 勝った場合は掛け金の2倍が手に入るか？
    await expect(doGame(SCISSORS, "0.5")).to.emit(rsp, 'ResultNotification').withArgs(WIN, convertEth("1.0"));

    // 実際に手持ちが増えているか？
    aftBalance = await rsp.balanceOf(addr1.address);
    expect(aftBalance.sub(befBalance)).to.equal(convertEth("1.0"));

    // スコアのチェック
    score = await rsp.scoreOfOwner(addr1.address);
    expect(score.winCount).equal(1);
    expect(score.loseCount).equal(0);
    expect(score.drawCount).equal(0);
  })

  it("Should return no token once player lose", async () => {
    await rsp.connect(addr1).getToken();
    await expect(doGame(ROCK, "0.5")).to.emit(rsp, 'ResultNotification').withArgs(LOSE, 0);

    // スコアのチェック
    score = await rsp.scoreOfOwner(addr1.address);
    expect(score.winCount).equal(0);
    expect(score.loseCount).equal(1);
    expect(score.drawCount).equal(0);
  })

  it("Should return no token once player draw", async () => {
    await rsp.connect(addr1).getToken();
    await expect(doGame(PAPER, "0.5")).to.emit(rsp, 'ResultNotification').withArgs(DRAW, 0);

    // スコアのチェック
    score = await rsp.scoreOfOwner(addr1.address);
    expect(score.winCount).equal(0);
    expect(score.loseCount).equal(0);
    expect(score.drawCount).equal(1);
  })
});
