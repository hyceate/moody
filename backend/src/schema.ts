import { makeExecutableSchema } from '@graphql-tools/schema';
import pinTypeDefs from './models/gql/pin.graphql';
import userTypeDefs from './models/gql/user.graphql';
import boardTypeDefs from './models/gql/board.graphql';
import { userResolvers } from './resolvers/userResolvers';
import { pinResolvers } from './resolvers/pinResolvers';
import { boardResolvers } from './resolvers/boardResolvers';

const typeDefs = [userTypeDefs, boardTypeDefs, pinTypeDefs];

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...pinResolvers.Query,
    ...boardResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...pinResolvers.Mutation,
    ...boardResolvers.Mutation,
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
