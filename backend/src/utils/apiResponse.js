export const sendSuccess = (
  res,
  data = null,
  message = "Request successful",
  statusCode = 200,
  meta = null
) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    ...(meta && { meta })
  });
};

export const sendError = (
  res,
  message = "An error occurred",
  statusCode = 500,
  details = null
) => {
  const errorBody = { message };
  if (details !== null && details !== undefined) {
    errorBody.details = details;
  }

  return res.status(statusCode).json({
    success: false,
    statusCode,
    error: errorBody
  });
};

// Functional namespace object
export const ApiResponse = {
  success: sendSuccess,
  error: sendError
};

