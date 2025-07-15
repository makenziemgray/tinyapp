const { assert } = require('chai');

// Assume urlsForUser is already implemented and exported
const { urlsForUser } = require('../helpers'); // Update path if needed

describe('urlsForUser', function() {
  const urlDatabase = {
    "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
    "9sm5xK": { longURL: "http://www.google.com", userId: "user2" },
    "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
  };

  it('should return urls that belong to the specified user', function() {
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    const result = urlsForUser('user1', urlDatabase);
    assert.deepEqual(result, expectedOutput);
  });

  it('should return an empty object if the user has no urls', function() {
    const result = urlsForUser('nonExistentUser', urlDatabase);
    assert.deepEqual(result, {});
  });

  it('should return an empty object if urlDatabase is empty', function() {
    const emptyDatabase = {};
    const result = urlsForUser('user1', emptyDatabase);
    assert.deepEqual(result, {});
  });

  it('should not return urls that don’t belong to the specified user', function() {
    const result = urlsForUser('user2', urlDatabase);

    const expectedOutput = {
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" }
    };

    assert.deepEqual(result, expectedOutput);
    assert.notProperty(result, "b2xVn2");
    assert.notProperty(result, "a1b2c3");
  });
});