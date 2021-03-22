import { gql } from 'apollo-server';
import * as yup from 'yup';

export const typeDefs = gql`
  input EditPhotoInput {
    photoId: ID!
  }

  extend type Mutation {
    """
    Edit photo labels.
    """
    editPhoto(edit: EditPhotoInput): Photo
  }
`;

const editPhotoInputSchema = yup.object().shape({
  photoId: yup
    .string()
    .required()
    .trim(),
});

export const resolvers = {
  Mutation: {
    editPhoto: async (
      obj,
      args,
      { models: { Photo }, authService },
    ) => {
      authService.assertIsAuthorized();

      const normalizedEdit = await editPhotoInputSchema.validate(
        args.edit,
        {
          stripUnknown: true,
        },
      );

      const photo = await Photo.query().findById(normalizedEdit.photoId);
      const tags = JSON.parse(photo.tags);
      let getlabels = [];

      const labels = tags.map((node) => {
        if (node.confidence > 20) {
          getlabels = [...getlabels, node.tag.en];
        }
        return true;
      });

      // eslint-disable-next-line no-console
      console.log(labels.length);

      await Photo.query()
        .where({ id: normalizedEdit.photoId })
        .update({ labels: getlabels });

      return Photo.query().findById(normalizedEdit.photoId);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
