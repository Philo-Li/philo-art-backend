import { gql, ForbiddenError } from 'apollo-server';
import * as yup from 'yup';

export const typeDefs = gql`
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
  photoId: yup
    .string()
    .required()
    .trim(),
  collectionId: yup
    .string()
    .required()
    .trim(),
});

export const resolvers = {
  Mutation: {
    deleteCollectedPhoto: async (obj, args, { models: { CollectedPhoto }, authService }) => {
      const userId = authService.assertIsAuthorized();

      const normalizedInput = await UncollectPhotoInputSchema.validate(
        args.uncollect,
        {
          stripUnknown: true,
        },
      );

      const collectedPhoto = await CollectedPhoto.query()
        .findOne({ photoId: normalizedInput.photoId, collectionId: normalizedInput.collectionId });

      if (collectedPhoto) {
        if (collectedPhoto.userId !== userId) {
          throw new ForbiddenError('User is not authorized to delete the collected photo');
        }

        await CollectedPhoto.query()
          .findById(collectedPhoto.id)
          .delete();
      }

      return true;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
