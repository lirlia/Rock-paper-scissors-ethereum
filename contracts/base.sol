//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Base {
  enum Hands {
      Rock,
      Paper,
      Scissors
  }

  enum Results {
      Win,
      Lose,
      Draw
  }

  struct Score {
      uint8 winCount;
      uint8 loseCount;
      uint8 drawCount;
  }
}
