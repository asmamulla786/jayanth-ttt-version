export class Sessions {
  #nextId;
  #sessions;
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