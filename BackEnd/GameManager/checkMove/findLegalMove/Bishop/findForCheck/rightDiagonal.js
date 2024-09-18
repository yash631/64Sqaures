const getBoard = require("../../../../Board/createBoard");
const Rook = require("../../Rook/findForCheck/discoveredCheck");

function rightDiag(square, king, color, piece, gameid) {
  /* Right Diagonal up-right */
  let rank = square[0],
    file = square[1];
    let board = getBoard.getCurrentBoard(gameid)
  while (--rank >= 0 && ++file <= 7) {
    if (board[rank][file] == king) {
      return {piece, rank : square[0], file : square[1]};
    } else if (board[rank][file] != " ") {
      break;
    }
  }
  /* Right Diagonal down-left */
  (rank = square[0]), (file = square[1]);
  while (++rank <= 7 && --file >= 0) {
    if (board[rank][file] == king) {
      return {piece, rank : square[0], file : square[1]};
    } else if (board[rank][file] != " ") {
      break;
    }
  }
  if (piece != "q") {
    /* Discovered checks */
    const inGamePcs = getBoard.createInGamePcs(board);
    /* Check for Discovered check from Bishop */
    const r = Rook.rookDiscovery(board, "r", inGamePcs, king, color);
    if (r) {
      return r;
    }
    /*  Check for Discovered check from Queen */
    const q = Rook.rookDiscovery(board, "q", inGamePcs, king, color);
    if (q) {
      return q;
    }
  }
  return 0;
}
module.exports = { rightDiag };
