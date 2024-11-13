class Game {
  constructor() {
    this.board = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    this.isPlaying = false;
    this.score = 0;
  }

  addRandomTile = () => {
    const randomSpotGenerator = () => Math.floor(Math.random() * 4);
    let x;
    let y;
    do {
      x = randomSpotGenerator();
      y = randomSpotGenerator();
    } while (this.board[x][y] != 0);

    const tileValue = Math.random() > 0.9 ? 4 : 2;

    // place tile on board
    this.board[x][y] = tileValue;
    this.placeTileOnBoard(tileValue, { x, y });
    this.renderChanges();
  };

  placeTileOnBoard = (amount, { x, y }) => {
    const tile = document.createElement("div");
    // background tile
    // tile-number   -> used for background colors
    // loc-x-y       -> used for placing on grid using grid-row / grid-column
    if (amount == 0) {
      tile.classList.add("boardSquare", `loc-${x}-${y}`);
    } else {
      tile.classList.add("activeSquare", `tile-${amount}`, `loc-${x}-${y}`);
    }

    if (amount != 0) {
      tile.innerHTML = amount;
      tile.setAttribute("data-amount", amount);
    }
    document.querySelector(".board").insertAdjacentElement("beforeend", tile);
  };

  checkWin = () => {
    if (this.board.flat().includes(2048)) {
      this.renderEndScoreChanges();

      this.isPlaying = false;
      return true;
    }
    return false;
  };

  checkLoss = () => {
    let isLoss = false;
    if (this.board.flat().includes(0)) return false;

    for (let x = 0; x < this.board.length; x++) {
      // checking horizontal matches
      this.board[x].forEach((el, ind, arr) => {
        if (arr[ind + 1] != undefined && arr[ind + 1] == el) {
          isLoss = true;
          return;
        }
      });
      if (isLoss) return false;

      // end checking horizontal matches
      for (let y = 0; y < this.board[x].length; y++) {
        // check if there are any matches vertically that can be made
        if (this.board[y + 1] != undefined && this.board[y][x] == this.board[y + 1][x]) return false;
      }
    }

    // has lost
    this.renderEndScoreChanges();
    this.isPlaying = false;

    return true;
  };

  renderChanges = () => {
    document
      .querySelector(".board")
      .querySelectorAll(".activeSquare, .boardSquare, .targetSquare")
      .forEach((el) => el.remove());

    // update score
    document.querySelector(".score").textContent = this.score;

    for (let x = 0; x < this.board.length; x++) {
      for (let y = 0; y < this.board[0].length; y++) {
        if (this.board[x][y] != 0) {
          this.placeTileOnBoard(this.board[x][y], { x, y });
        }
        // background tiles
        this.placeTileOnBoard(0, { x, y });
      }
    }
  };

  renderEndScoreChanges = () => {
    const bestScore = localStorage.getItem("bestScore");
    if (!bestScore) {
      localStorage.setItem("bestScore", this.score);
      const bestHtml = document.querySelector(".best");
      bestHtml.textContent = this.score;
      bestHtml.classList.add("grow-lg");
      setTimeout(() => {
        bestHtml.classList.remove("grow-lg");
      }, 100);
    } else if (Number(bestScore) < this.score) {
      document.querySelector(".best").textContent = this.score;
      localStorage.setItem("bestScore", this.score);
    }

    const board = document.querySelector(".board");
    board.classList.add("dimBoard");
  };

  startNewGame = () => {
    const isFirstGame = this.board.flat().every((x) => x == 0);

    if (!isFirstGame) {
      this.board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      this.renderChanges();
      document.querySelector(".board").classList.remove("dimBoard");
    }

    this.isPlaying = true;
    this.score = 0;
    document.querySelector(".score").textContent = 0;
    // add first tile
    this.addRandomTile();
    this.addRandomTile();
  };

  moveRight = () => {
    if (!this.isPlaying) return;
    // just need to worry about horizontal
    for (let i = 0; i < this.board.length; i++) {
      let numsInRow = [];
      this.board[i].forEach((el) => {
        if (el != 0) {
          numsInRow.push(el);
        }
      });

      // combinations should happen from the very right side first
      // ex. [0,2,2,2] => [0,0,2,4]
      // dx. [0,2,2,2] NOT => [0,0,4,2]
      for (let k = numsInRow.length; k >= 0; k--) {
        if (numsInRow[k - 1] != undefined && numsInRow[k - 1] == numsInRow[k]) {
          // update score
          this.score += numsInRow[k] * 2;
          // merge together
          numsInRow[k] = numsInRow[k] * 2;
          // mark for removal
          numsInRow[k - 1] = -1;
        }
      }
      // do removal
      numsInRow = numsInRow.filter((x) => x != -1);

      const zerosPadding = Array(4 - numsInRow.length).fill(0);
      // overwrite row
      this.board[i] = zerosPadding.concat(numsInRow);
    }

    this.renderChanges();
  };

  moveLeft = () => {
    if (!this.isPlaying) return;
    // just need to worry about horizontal
    for (let i = 0; i < this.board.length; i++) {
      let numsInRow = [];
      this.board[i].forEach((el) => {
        if (el != 0) {
          numsInRow.push(el);
        }
      });

      // combinations should happen from the left side of the board first
      for (let k = 0; k < numsInRow.length; k++) {
        if (numsInRow[k + 1] != undefined && numsInRow[k + 1] == numsInRow[k]) {
          // update score
          this.score += numsInRow[k] * 2;
          // merge together
          numsInRow[k] = numsInRow[k] * 2;
          // mark for removal
          numsInRow[k + 1] = -1;
        }
      }
      // do removal
      numsInRow = numsInRow.filter((x) => x != -1);

      const zerosPadding = Array(4 - numsInRow.length).fill(0);
      // overwrite row
      this.board[i] = numsInRow.concat(zerosPadding);
    }

    this.renderChanges();
  };

  moveUp = () => {
    if (!this.isPlaying) return;
    // need to think about columns instead of rows
    // iterate over columns
    for (let row = 0; row < this.board.length; row++) {
      let numsInColumn = [];
      for (let col = 0; col < this.board[row].length; col++) {
        if (this.board[col][row] != 0) {
          numsInColumn.push(this.board[col][row]);
        }
      }

      // combinations should happen from the top to bottom
      for (let k = 0; k < numsInColumn.length; k++) {
        if (numsInColumn[k + 1] != undefined && numsInColumn[k + 1] == numsInColumn[k]) {
          // update score
          this.score += numsInColumn[k] * 2;
          // merge together
          numsInColumn[k] = numsInColumn[k] * 2;
          // mark for removal
          numsInColumn[k + 1] = -1;
        }
      }
      // do removal
      numsInColumn = numsInColumn.filter((x) => x != -1);

      const zerosPadding = Array(4 - numsInColumn.length).fill(0);
      const columnValues = numsInColumn.concat(zerosPadding);

      for (let col = 0; col < this.board[row].length; col++) {
        this.board[col][row] = columnValues.shift();
      }
    }

    this.renderChanges();
  };

  moveDown = () => {
    if (!this.isPlaying) return;
    // need to think about columns instead of rows
    // iterate over columns
    for (let row = 0; row < this.board.length; row++) {
      let numsInColumn = [];
      for (let col = 0; col < this.board[row].length; col++) {
        if (this.board[col][row] != 0) {
          numsInColumn.push(this.board[col][row]);
        }
      }

      // combinations should happen from the bottom up
      for (let k = numsInColumn.length - 1; k >= 0; k--) {
        if (numsInColumn[k - 1] != undefined && numsInColumn[k - 1] == numsInColumn[k]) {
          // update score
          this.score += numsInColumn[k] * 2;
          // merge together
          numsInColumn[k] = numsInColumn[k] * 2;
          // mark for removal
          numsInColumn[k - 1] = -1;
        }
      }

      // do removal
      numsInColumn = numsInColumn.filter((x) => x != -1);

      const zerosPadding = Array(4 - numsInColumn.length).fill(0);
      const columnValues = zerosPadding.concat(numsInColumn);

      for (let col = 0; col < this.board[row].length; col++) {
        this.board[col][row] = columnValues.shift();
      }
    }

    this.renderChanges();
  };
}
