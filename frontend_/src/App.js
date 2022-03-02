import rock from './img/rock.png';
import scissors from './img/scissors.png';
import paper from './img/paper.png';
import coin from './img/coin.png';
import vs from './img/vs.png';
import './App.css';
import { ethers } from "ethers";

const handIcons = { rock, scissors, paper };
const hands = ["rock", "scissors", "paper"];

// A Web3Provider wraps a standard Web3 provider, which is
// what MetaMask injects as window.ethereum into each page
const provider = new ethers.providers.Web3Provider(window.ethereum)

// MetaMask requires requesting permission to connect users accounts
await provider.send("eth_requestAccounts", []);

// The MetaMask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...
const signer = provider.getSigner()

function getTokenButton() {
}

function HandsButton(props) {
  return (
    <button id={props.hand} className="col m-3 p-3 d-flex btn btn-default align-items-center justify-content-center">
        <img src={handIcons[props.hand]} alt={props.hand} />
    </button>
  );
}

function App() {
  return (
    <div className="App">
      <div className="container-fluid p-3 m-0 bg-success text-white">
        <div className="row">
          <div className="col fs-4 d-flex align-items-center justify-content-center">
            保有トークン数: <span id="my-token">xxx</span> ETH
          </div>
          <div className="col fs-4 d-flex align-items-center justify-content-center">
            戦績: <span id="my-score">100 勝 10 敗 10 引分</span>
          </div>
          {/* TODO token が 0のときのみ */}
          <div className="col fs-4 d-flex align-items-center justify-content-center">
            トークンをGet → <img className="img-fluid image-coin" src={coin} alt="coin" />
          </div>
        </div>
      </div>
      <div className="container">

        <p className="fs-1 py-3">出したい手と掛け金を選んでください</p>
        <input name="bet" className="form-control" type="text" placeholder="賭けたいトークン量(ETH単位)"></input>
        {/* グーチョキパーボタンの表示 */}
        <div className="row border my-5">
          { hands.map((hand) => <HandsButton hand={hand} />) }
        </div>
        <p className="fs-1 py-3">結果 : <span id="result">引き分け</span></p>
        <div className="d-flex border p-5 my-5">
          <div className="d-inline-flex flex-column-reverse flex-grow-1 justify-content-center" id="you">
            <div>
              <img src={scissors} alt="scissors" />
            </div>
            <p className="fs-3">あなた</p>
          </div>
          <div className="d-inline-flex flex-column-reverse flex-grow-1 justify-content-center">
            <div>
              <img className="w-50" src={vs} alt="vs" />
            </div>
          </div>
          <div className="d-inline-flex flex-column-reverse flex-grow-1 justify-content-center" id="cpu">
            <div>
              <img src={scissors} alt="scissors" />
            </div>
            <p className="fs-3">CPU</p>
          </div>
        </div>

      </div>

      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          aaa
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
    </div>
  );
}

export default App;
