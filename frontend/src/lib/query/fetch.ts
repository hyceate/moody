import { GraphQLClient } from 'graphql-request';
export const endpoint = 'http://localhost:3000/api/graphql';

const createGraphQLClient = () => {
  return new GraphQLClient(endpoint, {
    credentials: 'include',
  });
};
export const client = createGraphQLClient();
export const fetchData = async <T>(
  query: string,
  variables: Record<string, any>,
): Promise<T> => {
  try {
    const response = await client.request(query, variables);
    return response as T;
  } catch (error) {
    throw new Error(`Error fetching data: ${(error as Error).message}`);
  }
};
