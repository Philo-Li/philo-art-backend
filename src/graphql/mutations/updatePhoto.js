import { gql, UserInputError, ForbiddenError } from 'apollo-server';
import * as yup from 'yup';

export const typeDefs = gql`
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
  photoId: yup
    .string()
    .required()
    .trim(),
  title: yup
    .string()
    .required()
    .trim(),
  summary: yup
    .string()
    .trim(),
  tag: yup
    .string()
    .trim(),
  license: yup
    .string()
    .trim(),
  content: yup
    .string()
    .trim(),
  published: yup
    .boolean()
    .required(),
});

export const resolvers = {
  Mutation: {
    updatePhoto: async (
      obj,
      args,
      { models: { Photo }, authService },
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedPhoto = await updatePhotoInputSchema.validate(
        args.photo,
        {
          stripUnknown: true,
        },
      );

      const id = normalizedPhoto.photoId;

      const photo = await Photo.query().findById(id);

      if (!photo) {
        throw new UserInputError(`Photo with id ${id} does not exist`);
      }

      if (photo.userId !== userId) {
        throw new ForbiddenError('User is not authorized to edit the photo');
      }

      await Photo.query()
        .findById(id)
        .update({
          id,
          userId,
          title: normalizedPhoto.title,
          content: normalizedPhoto.content,
          summary: normalizedPhoto.summary || '',
          tag: normalizedPhoto.tag,
          license: normalizedPhoto.license,
          viewCount: 0,
        });

      return Photo.query().findById(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
