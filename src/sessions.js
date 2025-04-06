export class Sessions {
  #nextId;
  #sessions;
  #waiting;

  constructor() {
    this.#sessions = new Map();
    this.#nextId = 1;
  }

  createSession(playerName) {
    const sessionId = this.#nextId++;
    this.#sessions.set(sessionId, {
      name: playerName,
      sessionId,
      status: 'waiting'
    });

    if (this.#waiting) {
      this.#sessions.get(this.#waiting).status = 'playing';
      this.#sessions.get(sessionId).status = 'playing';
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
}