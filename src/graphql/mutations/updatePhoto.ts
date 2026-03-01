import { GraphQLError } from 'graphql';
import * as yup from 'yup';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  input UpdatePhotoInput {
    photoId: ID!
    title: String!
    summary: String
    tag: String
    license: String
    content: String
    published: Boolean!
  }

  extend type Mutation {
    """
    Update a photo.
    """
    updatePhoto(photo: UpdatePhotoInput): Photo
  }
`;

const updatePhotoInputSchema = yup.object().shape({
  photoId: yup.string().required().trim(),
  title: yup.string().required().trim(),
  summary: yup.string().trim(),
  tag: yup.string().trim(),
  license: yup.string().trim(),
  content: yup.string().trim(),
  published: yup.boolean().required(),
});

interface UpdatePhotoArgs {
  photo: {
    photoId: string;
    title: string;
    summary?: string;
    tag?: string;
    license?: string;
    content?: string;
    published: boolean;
  };
}

export const resolvers = {
  Mutation: {
    updatePhoto: async (
      _obj: unknown,
      args: UpdatePhotoArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedPhoto = await updatePhotoInputSchema.validate(
        args.photo,
        {
          stripUnknown: true,
        }
      );

      const id = normalizedPhoto.photoId;

      const photo = await prisma.photo.findUnique({
        where: { id },
      });

      if (!photo) {
        throw new GraphQLError(`Photo with id ${id} does not exist`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (photo.userId !== userId) {
        throw new GraphQLError('User is not authorized to edit the photo', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const updatedPhoto = await prisma.photo.update({
        where: { id },
        data: {
          title: normalizedPhoto.title,
          description: normalizedPhoto.content,
          tags: normalizedPhoto.tag,
          license: normalizedPhoto.license,
        },
      });

      return updatedPhoto;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
