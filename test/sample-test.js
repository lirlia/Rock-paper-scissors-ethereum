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
          it("rock", async () => {
            expect(hand).equal(ROCK);
          })
          rock = true;
          break;
        case PAPER:
          it("rock", async () => {
            expect(hand).equal(PAPER);
          })
          paper = true;
          break;
        case SCISSORS:
          it("rock", async () => {
            expect(hand).equal(SCISSORS);
          })
          scissors = true;
          break;
      }
    }
  })

  it("Should get token if player have no token", async () => {
    // トークンの Mint
    await rsp.connect(addr1).getToken();

    // 保持トークン量が 1 ETH か？
    befBalance = await rsp.balanceOf(addr1.address);
    expect(befBalance).equal(convertEth("1.0"));
  })

  it("Should not get token if player have tokens", async () => {
    await rsp.connect(addr1).getToken();
    expect(rsp.connect(addr1).getToken()).to.be.reverted
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
      tx = await doGame(ROCK, "0.5");
      rc = await tx.wait();
      result = (await rc.events.find(x => x.event == "ResultNotification"));

      switch (result.args.result) {

        case WIN:
          winCount++;

          // 実際に手持ちが増えているか？
          aftBalance = await rsp.balanceOf(addr1.address);
          it("when win", async () => {
            expect(aftBalance.sub(befBalance)).to.equal(convertEth("1.0"));
          })
          break;

        case LOSE:
          loseCount++;

          // 手持ちが減っているか？
          aftBalance = await rsp.balanceOf(addr1.address);
          it("when lose", async () => {
            expect(aftBalance.sub(befBalance)).to.equal(convertEth("0.5"));
          })
          break;

        case DRAW:
          drawCount++;

          // 手持ちが減っているか？
          aftBalance = await rsp.balanceOf(addr1.address);
          it("when draw", async () => {
            expect(aftBalance.sub(befBalance)).to.equal(convertEth("0.5"));
          })
          break;
      }

      // スコアのチェック
      score = await rsp.scoreOfOwner(addr1.address);
      it("should have correct score", async () => {
        expect(score.winCount).equal(winCount);
        expect(score.loseCount).equal(loseCount);
        expect(score.drawCount).equal(drawCount);
      })
    }
  })
});
