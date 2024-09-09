const getBoard = require("../../../../Board/createBoard");
const LD = require("../../Bishop/findForCheck/leftDiagonal");
const RD = require("../../Bishop/findForCheck/rightDiagonal");
const FL = require("../../Rook/findForCheck/file");
const RNK = require("../../Rook/findForCheck/rank");
const DIR = require("../../Knight/findForCheck/allDirections");
const Bishop = require("../../Bishop/findForCheck/discoveredCheck");
const Rook = require("../../Rook/findForCheck/discoveredCheck");

function prom(piece, square, king, color, pawn) {
  if (piece === "q" || piece === "Q") {
    return (
      LD.leftDiag(square, king, color, piece) ||
      RD.rightDiag(square, king, color, piece) ||
      RNK.rank(square, king, color, piece) ||
      FL.file(square, king, piece)
    );
  } else if (piece === "r" || piece === "R") {
    return RNK.rank(square, king, color, piece) || FL.file(square, king, color, piece);
  } else if (piece === "n" || piece === "N") {
    return DIR.movesArray(
      square,
      [
        [2, 1],
        [1, 2],
        [-1, 2],
        [-2, 1],
        [-1, -2],
        [-2, -1],
        [1, -2],
        [2, -1],
      ],
      king,
      color
    );
  } else if (piece === "b" || piece === "B") {
    return LD.leftDiag(square, king, color, piece) || RD.rightDiag(square, king, color, piece);
  } else {
    /* Discovered checks */
    const inGamePcs = getBoard.createInGamePcs(getBoard.Board);
    /* Check for Discovered check from Bishop */
    const b = Bishop.bishopDiscovery(
      getBoard.Board,
      "b",
      inGamePcs,
      king,
      color
    );
    if (b) {
      return b;
    }
    /* Check for Discovered check from Rook */
    const r = Rook.rookDiscovery(getBoard.Board, "r", inGamePcs, king, color);
    if (r) {
      return r;
    }
    /* Check for Discovered check from Queen */
    const q =
      Bishop.bishopDiscovery(getBoard.Board, "q", inGamePcs, king, color) ||
      Rook.rookDiscovery(getBoard.Board, "q", inGamePcs, king, color);
    if (q) {
      return q;
    }
  }

  return 0;
}

module.exports = { prom };
