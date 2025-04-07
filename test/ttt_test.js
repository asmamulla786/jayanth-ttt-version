import { assert, assertEquals, assertFalse } from 'jsr:@std/assert';
import { TicTacToe } from '../src/ttt.js';

Deno.test('should initialize empty board', () => {
  const game = new TicTacToe('Alice', 'Bob');
  const board = game.getBoard();

  board.forEach(row => {
    row.forEach(cell => {
      assertEquals(cell, null);
    });
  });
});

Deno.test('should allow valid moves and alternate turns', () => {
  const game = new TicTacToe('Alice', 'Bob');

  assert(game.mark(0, 0)); // Alice
  assertEquals(game.getBoard()[0][0], 'X');

  assert(game.mark(1, 1)); // Bob
  assertEquals(game.getBoard()[1][1], 'O');
});

Deno.test('should reject invalid moves (occupied cell)', () => {
  const game = new TicTacToe('Alice', 'Bob');

  assert(game.mark(0, 0));
  assertFalse(game.mark(0, 0)); // Already marked
});

Deno.test('should detect winner in a row', () => {
  const game = new TicTacToe('Alice', 'Bob');

  game.mark(0, 0); // X
  game.mark(1, 0); // O
  game.mark(0, 1); // X
  game.mark(1, 1); // O
  game.mark(0, 2); // X - Wins

  assertEquals(game.getWinner(), 'Alice');
  assert(game.isGameOver());
});

Deno.test('should detect winner in a column', () => {
  const game = new TicTacToe('Alice', 'Bob');

  game.mark(0, 0); // X
  game.mark(0, 1); // O
  game.mark(1, 0); // X
  game.mark(1, 1); // O
  game.mark(2, 0); // X - Wins

  assertEquals(game.getWinner(), 'Alice');
});

Deno.test('should detect winner in a diagonal', () => {
  const game = new TicTacToe('Alice', 'Bob');

  game.mark(0, 0); // X
  game.mark(0, 1); // O
  game.mark(1, 1); // X
  game.mark(0, 2); // O
  game.mark(2, 2); // X - Wins

  assertEquals(game.getWinner(), 'Alice');
});

Deno.test('should detect a draw', () => {
  const game = new TicTacToe('Alice', 'Bob');

  game.mark(0, 0); // X
  game.mark(0, 1); // O
  game.mark(0, 2); // X
  game.mark(1, 1); // O
  game.mark(1, 0); // X
  game.mark(1, 2); // O
  game.mark(2, 1); // X
  game.mark(2, 0); // O
  game.mark(2, 2); // X

  assert(game.isDraw());
  assert(game.isGameOver());
  assertEquals(game.getWinner(), null);
});

Deno.test('should reset the game correctly', () => {
  const game = new TicTacToe('Alice', 'Bob');

  game.mark(0, 0);
  game.mark(1, 1);
  game.mark(0, 1);
  game.mark(2, 2);
  game.mark(0, 2); // Win

  game.reset();

  assertEquals(game.getWinner(), null);
  assertEquals(game.isGameOver(), false);
  assertEquals(game.isDraw(), false);
  game.getBoard().forEach(row => row.forEach(cell => assertEquals(cell, null)));
});

Deno.test('should win when reverse diagonal is filled', () => {
  const game = new TicTacToe('Alice', 'Bob');

  game.mark(0, 2); // X
  game.mark(0, 1); // O
  game.mark(1, 1); // X
  game.mark(0, 0); // O
  game.mark(2, 0); // X - Wins

  assertEquals(game.getWinner(), 'Alice');
});

Deno.test('should provide the game state for the current player', () => {
  const game = new TicTacToe({ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' });

  const state = game.getGameState(1);
  assertEquals(state, {
    you: { name: 'Alice', symbol: 'X' },
    opponent: { name: 'Bob', symbol: 'O' },
    board: ['', '', '', '', '', '', '', '', ''],
    isYourTurn: true,
  });
})

Deno.test('should provide the game state for the opponent', () => {
  const game = new TicTacToe({ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' });

  const state = game.getGameState(2);
  assertEquals(state, {
    you: { name: 'Bob', symbol: 'O' },
    opponent: { name: 'Alice', symbol: 'X' },
    board: ['', '', '', '', '', '', '', '', ''],
    isYourTurn: false,
  });
})

Deno.test('should provide the game state for the current player after marking', () => {
  const game = new TicTacToe({ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' });

  game.mark(0, 0); // Alice
  const state = game.getGameState(2);
  assertEquals(state, {
    you: { name: 'Bob', symbol: 'O' },
    opponent: { name: 'Alice', symbol: 'X' },
    board: ['X', '', '', '', '', '', '', '', ''],
    isYourTurn: true,
  });
})

Deno.test('should provide the game state for the opponent player after marking', () => {
  const game = new TicTacToe({ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' });

  game.mark(0, 0); // Alice
  const state = game.getGameState(1);
  assertEquals(state, {
    you: { name: 'Alice', symbol: 'X' },
    opponent: { name: 'Bob', symbol: 'O' },
    board: ['X', '', '', '', '', '', '', '', ''],
    isYourTurn: false,
  });
})
