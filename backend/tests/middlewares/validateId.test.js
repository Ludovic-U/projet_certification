const { validateId } = require("../../middlewares/validateId");

describe("validateId middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should call next and convert param to number when ID is valid", () => {
    req.params.id = "5";

    validateId("id")(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.params.id).toBe(5);
  });

  it("should return 400 for non-integer string", () => {
    req.params.id = "abc";

    validateId("id")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid id" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 for negative number", () => {
    req.params.id = "-3";

    validateId("id")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid id" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 for zero", () => {
    req.params.id = "0";

    validateId("id")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid id" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 400 if param is missing", () => {
    validateId("id")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid id" });
    expect(next).not.toHaveBeenCalled();
  });
});
