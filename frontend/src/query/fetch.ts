import request from 'graphql-request';

export const fetchData = async <T>(
  endpoint: string,
  query: string,
  variables: Record<string, any>,
): Promise<T> => {
  try {
    const response = await request(endpoint, query, variables);
    return response as T;
  } catch (error) {
    throw new Error(`Error fetching data: ${(error as Error).message}`);
  }
};
