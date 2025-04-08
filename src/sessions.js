import { TicTacToe } from './ttt.js';

export class Sessions {
  #nextId;
  #sessions;
  #waiting;

  constructor() {
    this.#sessions = new Map();
    this.#nextId = 1;
  }

  #createGame(sessionId) {
    this.#sessions.get(this.#waiting).status = 'playing';
    this.#sessions.get(sessionId).status = 'playing';
    const p1 = this.#sessions.get(this.#waiting);
    const p2 = this.#sessions.get(sessionId);
    return new TicTacToe(
      { id: p1.sessionId, name: p1.name },
      { id: p2.sessionId, name: p2.name }
    );
  }

  isWaiting(sessionId) {
    return (
      this.isValidSession(sessionId) &&
      this.#sessions.get(sessionId).status === 'waiting'
    );
  }

  isPlaying(sessionId) {
    return (
      this.isValidSession(sessionId) &&
      this.#sessions.get(sessionId).status === 'playing'
    );
  }

  createSession(playerName) {
    const sessionId = this.#nextId++;
    this.#sessions.set(sessionId, {
      name: playerName,
      sessionId,
      status: 'waiting',
    });

    if (this.#waiting) {
      const game = this.#createGame(sessionId);
      this.#sessions.get(this.#waiting).game = game;
      this.#sessions.get(sessionId).game = game;
      this.#waiting = undefined;
    } else {
      this.#waiting = sessionId;
    }

    return sessionId;
  }

  getSession(sessionId) {
    return this.#sessions.get(sessionId);
  }

  removeSession(sessionId) {
    this.#sessions.delete(sessionId);
  }

  isValidSession(sessionId) {
    return this.#sessions.has(sessionId);
  }

  getStatus(sessionId) {
    const session = this.#sessions.get(sessionId);
    return session ? session.status : undefined;
  }

  getGameState(sessionId) {
    const game = this.#sessions.get(sessionId)?.game;
    return game.getGameState(sessionId);
  }
}
