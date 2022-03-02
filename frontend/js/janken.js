import rspAbi from '../../artifacts/contracts/Rsp.sol/Rsp.json' assert { type: "json" };

// A Web3Provider wraps a standard Web3 provider, which is
// what MetaMask injects as window.ethereum into each page
const provider = new ethers.providers.Web3Provider(window.ethereum)

// MetaMask requires requesting permission to connect users accounts
await provider.send("eth_requestAccounts", []);

// The MetaMask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...
const signer = provider.getSigner()
const signerAddress = await signer.getAddress();
// You can also use an ENS name for the contract address
const rspAddress = "0xf4B146FbA71F41E0592668ffbF264F1D186b2Ca8";

// The ERC-20 Contract ABI, which is a common contract interface
// for tokens (this is the Human-Readable ABI format)

// The Contract object
const rspContract = new ethers.Contract(rspAddress, rspAbi.abi, provider);
const rsp = rspContract.connect(signer);

const hands = ["rock","paper","scissors"];
const results = ["勝ち","負け","引き分け"];

initialize();

// event でも画面更新する
rsp.on("TokenNotification", myToken => {
  displayToken(myToken);
})

rsp.on("ResultNotification", (result, _, totalToken, playerHand, cpuHand, score) => {
  displayMatchResult(playerHand, cpuHand, result);
  displayScore(score);
  displayToken(totalToken);
})

// トークンGet押下時の処理
$("#getToken").click(async () => {
  const tx = await getTokenABI();
  const rc = await tx.wait();
  const token = ethers.utils.parseEther($("#myToken").text()).add(rc.events[0].args.value)
  displayToken(token);
});

// じゃんけん実行
$(".rsp").click(async function() {
  resetMatchResultDisplay();
  let token = $("#bet").val();

  if (token === "") {
    token = (await balanceOfABI()).div(2);
    token = ethers.utils.formatEther(token).toString();
  }
  const playerHand = getKeyByValue(hands, $(this).attr('id'));
  const tx = await doGamABI(playerHand, token);
  const r = (await tx.wait()).events[0].args;

  // トランザクションの結果から画面を更新する
  displayMatchResult(r.playerHand, r.cpuHand, r.result);
  displayScore(r.score);
  displayToken(r.totalToken);
});

// 初期設定
async function initialize() {
  const myToken = await balanceOfABI();
  displayToken(myToken);
  displayScore();
}

function resetMatchResultDisplay() {
  $("#playerHand").attr('src', "");
  $("#cpuHand").attr('src', "");
  $("#result").text("");
}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

// token の保持数を画面に描画する
function displayToken(token) {
  token = ethers.utils.formatEther(token).toString();
  $("#myToken").text(`${token}`);
}

async function displayScore() {
  const score = await getScoreABI();
  $("#myScore").text(`戦績: ${score[0]} 勝 / ${score[1]} 敗 / ${score[2]} 分`);
}

function displayMatchResult(playerHand, cpuHand, result) {
  $("#playerHand").attr('src', `./img/${hands[playerHand]}.png`);
  $("#cpuHand").attr('src', `./img/${hands[cpuHand]}.png`);
  $("#result").text(results[result]);
}

async function doGamABI(hand, token) {
  return await rsp.doGame(hand, ethers.utils.parseEther(token));
}
// 保有している token 数を取得する
async function balanceOfABI() { return await rsp.balanceOf(signerAddress); }
// スコアを取得する
async function getScoreABI() { return await rsp.scoreOfOwner(signerAddress); }
// token を取得する ABI を実行する
async function getTokenABI() { return await rsp.getToken(); }
