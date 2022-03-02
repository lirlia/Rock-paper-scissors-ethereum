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
const rspAddress = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";

// The ERC-20 Contract ABI, which is a common contract interface
// for tokens (this is the Human-Readable ABI format)

// The Contract object
const rspContract = new ethers.Contract(rspAddress, rspAbi.abi, provider);
const rsp = rspContract.connect(signer);

const hands = ["rock","paper","scissors"];
const results = ["勝ち","負け","引き分け"];

// token 量が変動したら実行される
rsp.on("TokenNotification", myToken => {
  displayToken(myToken);
})

rsp.on("ResultNotification", (result, _, playerHand, cpuHand, score) => {
  displayMatchResult(playerHand, cpuHand, result);
  displayScore(score);
})

initialize();

// トークンGet押下時の処理
$("#getToken").click(() => {
  getTokenABI();
});

// じゃんけん実行
$(".rsp").click(async function() {
  const token = $("#bet").val();
  if (token === "") {
    token = (await balanceOfABI()).div(2);
  }
  doGamABI(hands[$(this).attr('id')], token);
});

// 初期設定
async function initialize() {
  const myToken = await balanceOfABI();
  displayToken(myToken);
  displayScore();
}

// token の保持数を画面に描画する
function displayToken(token) {
  token = ethers.utils.formatEther(token).toString();
  $("#myToken").text(`保有トークン数 : ${token} ポイント`);
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
  await rsp.doGame(hand, {value: ethers.BigNumber.from(token)});
}
// 保有している token 数を取得する
async function balanceOfABI() { return await rsp.balanceOf(signerAddress); }
// スコアを取得する
async function getScoreABI() { return await rsp.scoreOfOwner(signerAddress); }
// token を取得する ABI を実行する
async function getTokenABI() { await rsp.getToken(); }
