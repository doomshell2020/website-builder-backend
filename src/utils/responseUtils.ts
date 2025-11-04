// responseUtils.ts

interface SuccessResponseBody<T> {
  status: true;
  message: string | null;
  result: T;
}

interface SuccessResponse<T> {
  statusCode: number;
  body: SuccessResponseBody<T>;
}

export const successResponse = <T = any>(
  message: string | null = null,
  result: T = '' as unknown as T
): SuccessResponse<T> => {
  return {
    statusCode: 200,
    body: {
      status: true,
      message,
      result,
    },
  };
};
