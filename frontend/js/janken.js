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
console.log(signerAddress);
// You can also use an ENS name for the contract address
const rspAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// The ERC-20 Contract ABI, which is a common contract interface
// for tokens (this is the Human-Readable ABI format)

// The Contract object
const rspContract = new ethers.Contract(rspAddress, rspAbi.abi, provider);
const rsp = rspContract.connect(signer);

const hands = ["rock", "paper", "scissors"];
const results = ["勝ち", "負け", "引き分け"];

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

// hover 時の処理
const borderClass="border-primary";
$(".rsp").hover(
  function () {
    $(this).addClass(borderClass);
  },
  function () {
    $(this).removeClass(borderClass);
  }
)

// じゃんけん実行
$(".rsp").click(async function () {
  resetMatchResultDisplay();

  // validation
  let token = $("#bet").val();
  const balanceTokenBigNum = await balanceOfABI();
  const balanceToken = ethers.utils.formatEther(balanceTokenBigNum).toString();

  if (token === "") {
    token = balanceTokenBigNum.div(2);
    token = ethers.utils.formatEther(token).toString();
  } else if (token > balanceToken) {
    window.alert("手持ちを超えるトークンはベットできません");
    return
  }

  const playerHand = getKeyByValue(hands, $(this).attr('id'));

  try {
    const tx = await doGamABI(playerHand, token);
    const events = (await tx.wait()).events;

    // トランザクションの結果から画面を更新する
    events.forEach(function (e) {
      if (e.event === "ResultNotification") {
        displayMatchResult(
          e.args.playerHand,
          e.args.cpuHand,
          e.args.result);
        displayScore(e.args.score);
        displayToken(e.args.totalToken);
      }
    })
  } catch (err) {
    console.error(err);
    window.alert("トランザクションの実行に失敗しました");
  }
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

// ゲームを実行する
async function doGamABI(hand, token) {
  console.log(hand, token);
  return await rsp.doGame(hand, ethers.utils.parseEther(token));
}
// 保有している token 数を取得する
async function balanceOfABI() { return await rsp.balanceOf(signerAddress); }
// スコアを取得する
async function getScoreABI() { return await rsp.scoreOfOwner(signerAddress); }
// token を取得する ABI を実行する
async function getTokenABI() { return await rsp.getToken(); }
