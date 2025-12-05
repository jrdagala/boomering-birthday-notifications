import { Request, Response, NextFunction } from 'express';
import { bufferToJsonMiddleware } from '../buffer-to-json.middleware';

describe('bufferToJsonMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: undefined,
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  it('should parse Buffer body to JSON', () => {
    const jsonData = { firstName: 'John', lastName: 'Doe' };
    mockRequest.body = Buffer.from(JSON.stringify(jsonData));

    bufferToJsonMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.body).toEqual(jsonData);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle already parsed JSON', () => {
    const jsonData = { firstName: 'Jane', lastName: 'Smith' };
    mockRequest.body = jsonData;

    bufferToJsonMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.body).toEqual(jsonData);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle complex JSON objects', () => {
    const complexData = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
      lastName: 'Doe',
      birthday: '1990-05-15',
      address: {
        city: 'New York',
        state: 'NY',
        country: 'USA',
      },
    };
    mockRequest.body = Buffer.from(JSON.stringify(complexData));

    bufferToJsonMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.body).toEqual(complexData);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle empty Buffer', () => {
    mockRequest.body = Buffer.from('{}');

    bufferToJsonMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.body).toEqual({});
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle string body', () => {
    const jsonData = { test: 'data' };
    mockRequest.body = JSON.stringify(jsonData);

    bufferToJsonMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.body).toEqual(JSON.stringify(jsonData));
    expect(mockNext).toHaveBeenCalled();
  });

  it('should call next function', () => {
    mockRequest.body = Buffer.from(JSON.stringify({}));

    bufferToJsonMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should return 400 for invalid JSON in Buffer', () => {
    mockRequest.body = Buffer.from('invalid json {]');
    const mockStatus = jest.fn().mockReturnThis();
    const mockJson = jest.fn();
    mockResponse.status = mockStatus;
    mockResponse.json = mockJson;

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    bufferToJsonMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[bufferToJsonMiddleware]',
      '[bufferToJsonMiddleware] Failed to parse buffer to JSON:',
      expect.any(Error)
    );
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: 'Request Body must be a valid JSON',
    });
    expect(mockNext).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
