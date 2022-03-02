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
  Rsp = await ethers.getContractFactory("$Rsp");
  rsp = await Rsp.deploy();
  await rsp.deployed();
})

describe("rsp", function() {
  it("Should return correct result in all situations", async () => {
    expect(await rsp.$_checkResult(ROCK, SCISSORS)).equal(WIN);
    expect(await rsp.$_checkResult(PAPER, ROCK)).equal(WIN);
    expect(await rsp.$_checkResult(SCISSORS, PAPER)).equal(WIN);

    expect(await rsp.$_checkResult(ROCK, ROCK)).equal(DRAW);
    expect(await rsp.$_checkResult(PAPER, PAPER)).equal(DRAW);
    expect(await rsp.$_checkResult(SCISSORS, SCISSORS)).equal(DRAW);

    expect(await rsp.$_checkResult(SCISSORS, ROCK)).equal(LOSE);
    expect(await rsp.$_checkResult(ROCK, PAPER)).equal(LOSE);
    expect(await rsp.$_checkResult(PAPER, SCISSORS)).equal(LOSE);
  })

  it("Can generate", async () => {
    let rock = false;
    let paper = false;
    let scissors = false;
    let hand;

    while ((rock && paper && scissors) === false ) {

      hand = await rsp.$_generateHand();

      // it 内では同じ block が使われ続けるため毎度同じ手が生成されるため
      // evm_mine を叩いてい都度新しい block を生成する
      // see: https://hardhat.org/hardhat-network/#mining-modes
      await ethers.provider.send("evm_mine");

      switch (hand) {
        case ROCK:
          expect(hand).equal(ROCK);
          rock = true;
          break;
        case PAPER:
          expect(hand).equal(PAPER);
          paper = true;
          break;
        case SCISSORS:
          expect(hand).equal(SCISSORS);
          scissors = true;
          break;
      }
    }
  })

  it("Should get token if player have no token", async () => {

    // Mint後の保持トークン量が 1 ETH か？
    expect(await rsp.connect(addr1).getToken())
      .to.emit(rsp, "TokenNotification")
      .withArgs(convertEth("1.0"));
  })

  it("Should not get token if player have tokens", async () => {
    await rsp.connect(addr1).getToken();
    await expect(rsp.connect(addr1).getToken()).to.be.reverted;
  })

  it("Should earn or lost correct tokens", async () => {

    let winCount = 0;
    let loseCount = 0;
    let drawCount = 0;
    let tx, rc, result;

    // 勝ち、負け、引き分けが発生するまでループする
    while ((winCount === 0) || (loseCount === 0) || (drawCount === 0)) {

      // 初期トークンの mint
      befBalance = await rsp.balanceOf(addr1.address);
      if (befBalance == 0) {
        await rsp.connect(addr1).getToken();
        befBalance = await rsp.balanceOf(addr1.address);
      }

      // じゃんけんを行って event から結果を取得する
      tx = await doGame(ROCK, "1");
      rc = await tx.wait();
      result = (await rc.events.find(x => x.event == "ResultNotification"));

      switch (result.args.result) {

        case WIN:
          winCount++;

          // 実際に手持ちが増えているか？
          aftBalance = await rsp.balanceOf(addr1.address);
          expect(aftBalance.sub(befBalance)).to.equal(convertEth("2.0"));
          expect(result.args.playerHand).to.equal(ROCK);
          expect(result.args.cpuHand).to.equal(SCISSORS);
          expect(result.args.score.winCount).to.equal(winCount);
          expect(result.args.score.loseCount).to.equal(loseCount);
          expect(result.args.score.drawCount).to.equal(drawCount);
          break;

        case LOSE:
          loseCount++;

          // 手持ちが減っているか？
          aftBalance = await rsp.balanceOf(addr1.address);
          expect(aftBalance.sub(befBalance)).to.equal(convertEth("0"));
          expect(result.args.playerHand).to.equal(ROCK);
          expect(result.args.cpuHand).to.equal(PAPER);
          expect(result.args.score.winCount).to.equal(winCount);
          expect(result.args.score.loseCount).to.equal(loseCount);
          expect(result.args.score.drawCount).to.equal(drawCount);
          break;

        case DRAW:
          drawCount++;

          // 手持ちが減っているか？
          aftBalance = await rsp.balanceOf(addr1.address);
          expect(aftBalance.sub(befBalance)).to.equal(convertEth("0"));
          expect(result.args.playerHand).to.equal(ROCK);
          expect(result.args.cpuHand).to.equal(ROCK);
          expect(result.args.score.winCount).to.equal(winCount);
          expect(result.args.score.loseCount).to.equal(loseCount);
          expect(result.args.score.drawCount).to.equal(drawCount);
          break;
      }
    }
  })
});
