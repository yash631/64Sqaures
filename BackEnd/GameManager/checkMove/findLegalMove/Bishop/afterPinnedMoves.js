const not = require("../../notations");
const RNK = require("../Rook/findForCheck/rank");
const FL = require("../Rook/findForCheck/file");
const left = require("../Bishop/findForCheck/leftDiagonal");
const right = require("../Bishop/findForCheck/rightDiagonal");
const getBoard = require("../../../Board/createBoard");

function findMovesAfterPin(
  pinnedPiece,
  actualPiece,
  color,
  pinnedPcs,
  lm,
  inGamePcs,
  pinnedPiecePos
) {
  function captureCheck(rank, file, rows, cols) {
    lm[pinnedPiece][color][`${rank}${file}`].push(
      `${actualPiece}x${not.FILE[cols]}${not.RANK[rows]}+`
    );
  }
  function captureMove(rank, file, rows, cols) {
    lm[pinnedPiece][color][`${rank}${file}`].push(
      `${actualPiece}x${not.FILE[cols]}${not.RANK[rows]}`
    );
  }
  function normalMove(rank, file, rows, cols) {
    lm[pinnedPiece][color][`${rank}${file}`].push(
      `${actualPiece}${not.FILE[cols]}${not.RANK[rows]}`
    );
  }
  function normalCheck(rank, file, rows, cols) {
    lm[pinnedPiece][color][`${rank}${file}`].push(
      `${actualPiece}${not.FILE[cols]}${not.RANK[rows]}+`
    );
  }

  function findForcheck(currPinnedPiecePos) {
    const oppKing = not.KING[1 - color];
    const [rank, file] = currPinnedPiecePos;
    if (pinnedPiece == "q") {
      return (
        RNK.rank([rank, file], oppKing, color, "q") ||
        FL.file([rank, file], oppKing, color, "q") ||
        right.rightDiag([rank, file], king, color, "q") ||
        left.leftDiag([rank, file], king, color, "q")
      );
    } else {
      return (
        left.leftDiag([rank, file], oppKing, color, "r") ||
        right.rightDiag([rank, file], oppKing, color, "r")
      );
    }
  }

  const board = getBoard.Board;
  const pinnedPieceKey = `${pinnedPiecePos[0]}${pinnedPiecePos[1]}`;
  const kingPos = inGamePcs[not.KING[color]][0];
  let pinningPiece = pinnedPcs[color][pinnedPiece][pinnedPieceKey][0];
  // const pnPc = pinningPiece;
  // const pnPcPos = pinnedPcs[color][pinnedPiece][pinnedPieceKey][3];
  // console.log(pnPc,pnPcPos,[`${pnPcPos[0]}${pnPcPos[1]}`]);
  // console.log("legal moves of pinning piece", lm[pnPc][1-color]);
  /* To push the moves of Pinning Piece */
  if (color) {
    pinningPiece = pinningPiece.toLowerCase();
  } else {
    pinningPiece = pinningPiece.toUpperCase();
  }
  const pinningPiecePos = pinnedPcs[color][pinnedPiece][pinnedPieceKey][3];
  pinnedPcs[color][pinnedPiece][pinnedPieceKey][6] = [];
  pinnedPcs[color][pinnedPiece][pinnedPieceKey][7] = [];

  /* Function to add moves in the given direction */
  function addMoves(
    startRow,
    startCol,
    kingRow,
    kingCol,
    endRow,
    endCol,
    direction
  ) {
    let row = startRow,
      col = startCol;

    /* Add moves until pinned piece reaches king */
    while (row !== kingRow && col !== kingCol) {
      if (direction === "right-up") {
        row++;
        col--;
      } else if (direction === "right-down") {
        row--;
        col++;
      } else if (direction === "left-up") {
        row++;
        col++;
      } else if (direction === "left-down") {
        row--;
        col--;
      }
      if (row === kingRow && col === kingCol) {
        break;
      }
      if (board[row][col] != " ") break;
      if (findForcheck([row, col])) {
        normalCheck(startRow, startCol, row, col);
      } else {
        normalMove(startRow, startCol, row, col);
      }
    }

    (row = startRow), (col = startCol);

    /* Add moves until pinned piece reaches the pinningPiece */
    while (row !== endRow && col !== endCol) {
      if (direction === "right-up") {
        row--;
        col++;
      } else if (direction === "right-down") {
        row++;
        col--;
      } else if (direction === "left-up") {
        row--;
        col--;
      } else if (direction === "left-down") {
        row++;
        col++;
      }
      if (row == endRow && col == endCol) {
        break;
      }
      if (board[row][col] != " ") break;
      if (findForcheck([row, col])) {
        normalCheck(startRow, startCol, row, col);
      } else {
        normalMove(startRow, startCol, row, col);
      }
      pinnedPcs[color][pinnedPiece][pinnedPieceKey][6].push(
        `${pinningPiece}${not.FILE[col]}${not.RANK[row]}`
      );
    }
    if (row == endRow && col == endCol) {
      /* Add the capture move */
      if (findForcheck(pinningPiecePos)) {
        captureCheck(startRow, startCol, endRow, endCol);
      } else {
        captureMove(startRow, startCol, endRow, endCol);
      }
    }

    pinnedPcs[color][pinnedPiece][pinnedPieceKey][5] =
      lm[pinnedPiece][color][`${startRow}${startCol}`];

    /* Add pinning piece moves till it touches an edge of the board */
    (row = endRow), (col = endCol);
    while (row >= 0 && col >= 0 && row <= 7 && col <= 7) {
      if (direction === "right-up") {
        row--;
        col++;
      } else if (direction === "right-down") {
        row++;
        col--;
      } else if (direction === "left-up") {
        row--;
        col--;
      } else if (direction === "left-down") {
        row++;
        col++;
      }
      if (row > 7 || row < 0 || col > 7 || col < 0) {
        break;
      }
      if (board[row][col] != " ") break;
      pinnedPcs[color][pinnedPiece][pinnedPieceKey][6].push(
        `${pinningPiece}${not.FILE[col]}${not.RANK[row]}`
      );
    }
  }

  if (kingPos[0] > pinnedPiecePos[0] && kingPos[1] > pinnedPiecePos[1]) {
    /* Check from Left-Diagonal left */
    if (
      kingPos[0] - 1 >= 0 &&
      kingPos[1] - 1 >= 0 &&
      board[kingPos[0] - 1][kingPos[1] - 1] == " "
    ) {
      pinnedPcs[color][pinnedPiece][pinnedPieceKey][7].push(
        `${not.FILE[kingPos[1]-1]}${not.RANK[kingPos[0]-1]}`,
      );
    }
    if (
      kingPos[0] + 1 <= 7 &&
      kingPos[1] + 1 <= 7 &&
      board[kingPos[0] + 1][kingPos[1] + 1] == " "
    ) {
      pinnedPcs[color][pinnedPiece][pinnedPieceKey][7].push(
        `${not.FILE[kingPos[1]+1]}${not.RANK[kingPos[0]+1]}`,
      );
    }

    addMoves(
      pinnedPiecePos[0],
      pinnedPiecePos[1],
      kingPos[0],
      kingPos[1],
      pinningPiecePos[0],
      pinningPiecePos[1],
      "left-up"
    );
  } else if (kingPos[0] < pinnedPiecePos[0] && kingPos[1] < pinnedPiecePos[1]) {
    /* Check from Left-Diagonal right */
    if (
      kingPos[0] - 1 >= 0 &&
      kingPos[1] - 1 >= 0 &&
      board[kingPos[0] - 1][kingPos[1] - 1] == " "
    ) {
      pinnedPcs[color][pinnedPiece][pinnedPieceKey][7].push(
        `${not.FILE[kingPos[1]-1]}${not.RANK[kingPos[0]-1]}`,
      );
    }
    if (
      kingPos[0] + 1 <= 7 &&
      kingPos[1] + 1 <= 7 &&
      board[kingPos[0] + 1][kingPos[1] + 1] == " "
    ) {
      pinnedPcs[color][pinnedPiece][pinnedPieceKey][7].push(
        `${not.FILE[kingPos[1]+1]}${not.RANK[kingPos[0]+1]}`,
      );
    }
    addMoves(
      pinnedPiecePos[0],
      pinnedPiecePos[1],
      kingPos[0],
      kingPos[1],
      pinningPiecePos[0],
      pinningPiecePos[1],
      "left-down"
    );
  } else if (kingPos[0] < pinnedPiecePos[0] && kingPos[1] > pinnedPiecePos[1]) {
    /* Check from Right-Diagonal left */
    if (
      kingPos[0] - 1 >= 0 &&
      kingPos[1] + 1 <= 7 &&
      board[kingPos[0] - 1][kingPos[1] + 1] == " "
    ) {
      pinnedPcs[color][pinnedPiece][pinnedPieceKey][7].push(
        `${not.FILE[kingPos[1]+1]}${not.RANK[kingPos[0]-1]}`,
      );
    }
    if (
      kingPos[0] + 1 <= 7 &&
      kingPos[1] - 1 >= 0 &&
      board[kingPos[0] + 1][kingPos[1] - 1] == " "
    ) {
      pinnedPcs[color][pinnedPiece][pinnedPieceKey][7].push(
        `${not.FILE[kingPos[1]-1]}${not.RANK[kingPos[0]+1]}`,
      );
    }
    addMoves(
      pinnedPiecePos[0],
      pinnedPiecePos[1],
      kingPos[0],
      kingPos[1],
      pinningPiecePos[0],
      pinningPiecePos[1],
      "right-down"
    );
  } else if (kingPos[0] > pinnedPiecePos[0] && kingPos[1] < pinnedPiecePos[1]) {
    /* Check from Right-Diagonal right */
    if (
      kingPos[0] + 1 <= 7 &&
      kingPos[1] - 1 >= 0 &&
      board[kingPos[0] + 1][kingPos[1] - 1] == " "
    ) {
      pinnedPcs[color][pinnedPiece][pinnedPieceKey][7].push(
        `${not.FILE[kingPos[1]-1]}${not.RANK[kingPos[0]+1]}`,
      );
    }
    if (
      kingPos[0] - 1 >= 0 &&
      kingPos[1] + 1 <= 7 &&
      board[kingPos[0] - 1][kingPos[1] + 1] == " "
    ) {
      pinnedPcs[color][pinnedPiece][pinnedPieceKey][7].push(
        `${not.FILE[kingPos[1]+1]}${not.RANK[kingPos[0]-1]}`,
      );
    }
    addMoves(
      pinnedPiecePos[0],
      pinnedPiecePos[1],
      kingPos[0],
      kingPos[1],
      pinningPiecePos[0],
      pinningPiecePos[1],
      "right-up"
    );
  }
}
module.exports = { findMovesAfterPin };
