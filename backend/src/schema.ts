import { makeExecutableSchema } from '@graphql-tools/schema';
import pinTypeDefs from './models/gql/pin.graphql';
import userTypeDefs from './models/gql/user.graphql';
import boardTypeDefs from './models/gql/board.graphql';
import commentTypeDefs from './models/gql/comment.graphql';
import { userResolvers } from './resolvers/userResolvers';
import { pinResolvers } from './resolvers/pinResolvers';
import { boardResolvers } from './resolvers/boardResolvers';
import { commentResolvers } from './resolvers/commentResolvers';

const typeDefs = [userTypeDefs, boardTypeDefs, pinTypeDefs, commentTypeDefs];

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...pinResolvers.Query,
    ...boardResolvers.Query,
    ...commentResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...pinResolvers.Mutation,
    ...boardResolvers.Mutation,
    ...commentResolvers.Mutation,
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
