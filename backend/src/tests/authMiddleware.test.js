const { authorize } = require('../middleware/auth');

describe('Authorize Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: {
        role: 'user'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('should call next() if user role is authorized', () => {
    const middleware = authorize('user', 'admin');
    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('should return 403 if user role is not authorized', () => {
    const middleware = authorize('admin');
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("not authorized")
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
