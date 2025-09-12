/**
 * Creates a mock Express.js response object for use in unit tests.
 * The returned object includes mocked `status`, `json`, and `send` methods,
 * allowing you to test how your code interacts with the response.
 *
 * @returns {Object} Mocked response object with jest.fn() methods.
 */

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  };
}

module.exports = { createMockResponse };
