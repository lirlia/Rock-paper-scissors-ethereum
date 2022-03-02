//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";
import "./base.sol";


contract Rsp is Base, ERC20 {

    mapping(address => Score) public scoreOfOwner;

    constructor() ERC20("Janken", "RSP") {}

    event TokenNotification(uint token);
    event ResultNotification(Results result, uint token, Hands playerHand, Hands cpuHand, Score score);

    function _random(uint mod) internal view returns(uint){
        return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % mod;
    }

    // CPU のじゃんけんの手を生成する
    function _generateHand() internal view returns(Hands) {
        return Hands(_random(3));
    }

    // じゃんけんの手を比較して判定を行う
    function _checkResult(Hands player, Hands computer) internal pure returns(Results) {
        // draw
        if (player == computer) { return Results.Draw; }

        // win
        if (player == Hands.Rock && computer == Hands.Scissors) { return Results.Win; }
        if (player == Hands.Paper && computer == Hands.Rock) { return Results.Win; }
        if (player == Hands.Scissors && computer == Hands.Paper) { return Results.Win; }

        // lose
        return Results.Lose;
    }

    // 所持金が 0 なら token を mint する
    // ※実際はこんなことをやってはいけない
    function getToken() external {
        // TODO
        // require(balanceOf(msg.sender) == 0, "you already have token");
        _mint(msg.sender, 1 ether);
        emit TokenNotification(balanceOf(msg.sender));
    }

    // 掛け金の2倍の token を払い戻す
    function _sendRewardToken() internal returns(uint) {
        uint token = msg.value * 2;
        _mint(msg.sender, token);
        return token;
    }

    // じゃんけんを行う
    function doGame(Hands playerHand) external payable {
        require(msg.value > 0, "don't have enough token");

        // cpu の手を生成
        Hands cpuHand = _generateHand();

        // じゃんけん結果を出力
        Results result = _checkResult(playerHand, cpuHand);

        uint token = 0;
        if (result == Results.Win) {
            // player が勝利した場合は token を渡す
            token = _sendRewardToken();
            scoreOfOwner[msg.sender].winCount++;
        }

        if (result == Results.Lose) { scoreOfOwner[msg.sender].loseCount++; }
        if (result == Results.Draw) { scoreOfOwner[msg.sender].drawCount++; }

        console.log("player hand: '%d / computer hand: '%d' / result: '%d'",
            uint(playerHand),
            uint(cpuHand),
            uint(result)
        );

        emit TokenNotification(balanceOf(msg.sender));
        emit ResultNotification(result, token, playerHand, cpuHand, scoreOfOwner[msg.sender]);
    }
}
