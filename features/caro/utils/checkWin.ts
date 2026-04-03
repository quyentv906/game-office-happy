export type PlayerRole = "X" | "O" | null;

export function checkWin(board: PlayerRole[][], row: number, col: number, player: "X" | "O"): boolean {
  if (!board || board.length === 0) return false;
  const rows = board.length;
  const cols = board[0].length;

  const directions = [
    [0, 1],   // Ngang
    [1, 0],   // Dọc
    [1, 1],   // Chéo xuống
    [1, -1],  // Chéo lên
  ];

  for (let [dx, dy] of directions) {
    let count = 1;

    // Đếm theo chiều dương
    let i = row + dx;
    let j = col + dy;
    while (i >= 0 && i < rows && j >= 0 && j < cols && board[i][j] === player) {
      count++;
      i += dx;
      j += dy;
    }

    // Đếm theo chiều âm
    i = row - dx;
    j = col - dy;
    while (i >= 0 && i < rows && j >= 0 && j < cols && board[i][j] === player) {
      count++;
      i -= dx;
      j -= dy;
    }

    if (count >= 5) {
      return true;
    }
  }

  return false;
}
