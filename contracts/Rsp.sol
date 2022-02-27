//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./base.sol";

contract Rsp is Base {

    Score[] public Scores;
    mapping(address => Score) ScoreOfOwner;

    event ResultNotification(Results result, uint token);

    // じゃんけんの手を生成する
    function _generateHand() private pure returns(Hands) {
        Hands hand = Hands.Paper; // TODO
        return hand;
    }

    function _checkResult(Hands player, Hands computer) private pure returns(Results) {
        // draw
        if (player == computer) { return Results.Draw; }

        // win
        if (player == Hands.Rock && computer == Hands.Scissors) { return Results.Win; }
        if (player == Hands.Paper && computer == Hands.Rock) { return Results.Win; }
        if (player == Hands.Scissors && computer == Hands.Paper) { return Results.Win; }

        // lose
        return Results.Lose;
    }

    // 掛け金の2倍の token を払い戻す
    function _sendRewardToken() private returns(uint) {
        uint token = msg.value * 2;
        return token;
    }

    // じゃんけんを行う
    function doGame(Hands playerHand) external payable {
        require(msg.value > 0);

        Hands computerHand = _generateHand();
        Results result = _checkResult(playerHand, computerHand);

        // player が勝利した場合は token を渡す
        uint token = 0;
        if (result == Results.Win) { token = _sendRewardToken(); }

        console.log("player hand: '%d / computer hand: '%d' / result: '%d'",
            uint(playerHand),
            uint(computerHand),
            uint(result)
        );

        emit ResultNotification(result, token);
    }
}
