import { GraphQLError } from 'graphql';
import * as yup from 'yup';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  input UncollectPhotoInput {
    photoId: ID!
    collectionId: ID!
  }

  extend type Mutation {
    """
    Delete the collected photo which has the given id, if it is created by the authorized user.
    """
    deleteCollectedPhoto(uncollect: UncollectPhotoInput): Boolean
  }
`;

const UncollectPhotoInputSchema = yup.object().shape({
  photoId: yup.string().required().trim(),
  collectionId: yup.string().required().trim(),
});

interface DeleteCollectedPhotoArgs {
  uncollect: {
    photoId: string;
    collectionId: string;
  };
}

export const resolvers = {
  Mutation: {
    deleteCollectedPhoto: async (
      _obj: unknown,
      args: DeleteCollectedPhotoArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedInput = await UncollectPhotoInputSchema.validate(
        args.uncollect,
        {
          stripUnknown: true,
        }
      );

      const collectedPhoto = await prisma.collectedPhoto.findFirst({
        where: {
          photoId: normalizedInput.photoId,
          collectionId: normalizedInput.collectionId,
        },
      });

      if (collectedPhoto) {
        if (collectedPhoto.userId !== userId) {
          throw new GraphQLError(
            'User is not authorized to delete the collected photo',
            {
              extensions: { code: 'FORBIDDEN' },
            }
          );
        }

        await prisma.collectedPhoto.delete({
          where: { id: collectedPhoto.id },
        });
      }

      return true;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
