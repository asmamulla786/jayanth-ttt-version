import { assert, assertEquals, assertFalse } from 'jsr:@std/assert';
import { describe, it } from 'jsr:@std/testing/bdd';

import { Sessions } from "../src/sessions.js";

describe("Sessions class", () => {
  describe("createSession()", () => {
    it("should create a session and return a session ID", () => {
      const sessions = new Sessions();
      const playerName = "Player1";
      const sessionId = sessions.createSession(playerName);

      // Check that the session ID is a number
      assertEquals(typeof sessionId, "number");

      // Verify that the session exists in the sessions map
      const session = sessions.getSession(sessionId);
      assertEquals(session.name, playerName);
      assertEquals(session.sessionId, sessionId);
    });

    it("should create a game when the second player joins", () => {
      const sessions = new Sessions();
      const playerName1 = "Player1";
      const playerName2 = "Player2";
      const sessionId1 = sessions.createSession(playerName1);
      const sessionId2 = sessions.createSession(playerName2);
      const status1 = sessions.getStatus(sessionId1);
      const status2 = sessions.getStatus(sessionId2);
      assertEquals(status1, "playing");
      assertEquals(status2, "playing");
    });
  });

  describe("getSession()", () => {
    it("should return the correct session by ID", () => {
      const sessions = new Sessions();
      const playerName = "Player1";
      const sessionId = sessions.createSession(playerName);

      const session = sessions.getSession(sessionId);
      assertEquals(session.name, playerName);
      assertEquals(session.sessionId, sessionId);
    });

    it("should return undefined for an invalid session ID", () => {
      const sessions = new Sessions();
      const session = sessions.getSession(999); // An invalid ID
      assertEquals(session, undefined);
    });
  });

  describe("removeSession()", () => {
    it("should remove an existing session", () => {
      const sessions = new Sessions();
      const playerName = "Player1";
      const sessionId = sessions.createSession(playerName);

      sessions.removeSession(sessionId);

      const session = sessions.getSession(sessionId);
      assertEquals(session, undefined);
    });

    it("should not affect other sessions when removing one", () => {
      const sessions = new Sessions();
      const sessionId1 = sessions.createSession("Player1");
      const sessionId2 = sessions.createSession("Player2");

      sessions.removeSession(sessionId1);

      const session2 = sessions.getSession(sessionId2);
      assertEquals(session2.name, "Player2");
      assertEquals(session2.sessionId, sessionId2);
    });
  });

  describe("isValidSession()", () => {
    it("should return true for a valid session ID", () => {
      const sessions = new Sessions();
      const playerName = "Player1";
      const sessionId = sessions.createSession(playerName);

      const isValid = sessions.isValidSession(sessionId);
      assert(isValid);
    });

    it("should return false for an invalid session ID", () => {
      const sessions = new Sessions();
      const isValid = sessions.isValidSession(999); // Invalid session ID
      assertFalse(isValid);
    });
  });

  describe("getStatus()", () => {
    it("should return the status of a valid session", () => {
      const sessions = new Sessions();
      const playerName = "Player1";
      const sessionId = sessions.createSession(playerName);

      const status = sessions.getStatus(sessionId);
      assertEquals(status, "waiting");
    });

    it("the third player should be waiting", () => {
      const sessions = new Sessions();
      const sessionId1 = sessions.createSession("player1");
      const sessionId2 = sessions.createSession("player2");
      const sessionId3 = sessions.createSession("player3");

      const status1 = sessions.getStatus(sessionId1);
      const status2 = sessions.getStatus(sessionId2);
      const status3 = sessions.getStatus(sessionId3);
      assertEquals(status1, "playing");
      assertEquals(status2, "playing");
      assertEquals(status3, "waiting");
    });

    it("should return undefined for an invalid session ID", () => {
      const sessions = new Sessions();
      const status = sessions.getStatus(999); // Invalid session ID
      assertEquals(status, undefined);
    });
  })
});
