const not = require("../../notations");
const RNK = require("../Rook/findForCheck/rank");
const FL = require("../Rook/findForCheck/file");
const left = require("../Bishop/findForCheck/leftDiagonal");
const right = require("../Bishop/findForCheck/rightDiagonal");

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
  const pinnedPieceKey = `${pinnedPiecePos[0]}${pinnedPiecePos[1]}`;
  const kingPos = inGamePcs[not.KING[color]][0];
  let pinningPiece = pinnedPcs[color][pinnedPiece][pinnedPieceKey][0];
  if (color) {
    pinningPiece = pinningPiece.toLowerCase();
  } else{
    pinningPiece = pinningPiece.toUpperCase();
  }
  const pinningPiecePos = pinnedPcs[color][pinnedPiece][pinnedPieceKey][3];
  pinnedPcs[color][pinnedPiece][pinnedPieceKey][6] = [];

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
      if (findForcheck([row, col])) {
        normalCheck(startRow, startCol, row, col);
      } else {
        normalMove(startRow, startCol, row, col);
      }
      pinnedPcs[color][pinnedPiece][pinnedPieceKey][6].push(
        `${pinningPiece}${not.FILE[col]}${not.RANK[row]}`
      );
    }

    /* Add the capture move */
    if (findForcheck(pinningPiecePos)) {
      captureCheck(startRow, startCol, endRow, endCol);
    } else {
      captureMove(startRow, startCol, endRow, endCol);
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
      pinnedPcs[color][pinnedPiece][pinnedPieceKey][6].push(
        `${pinningPiece}${not.FILE[col]}${not.RANK[row]}`
      );
    }
  }

  if (kingPos[0] > pinnedPiecePos[0] && kingPos[1] > pinnedPiecePos[1]) {
    /* Check from Left-Diagonal left */
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
