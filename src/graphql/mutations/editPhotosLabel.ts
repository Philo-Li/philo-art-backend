import * as yup from 'yup';
import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
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
  photoId: yup.string().required().trim(),
});

interface EditPhotoArgs {
  edit: {
    photoId: string;
  };
}

interface TagEntry {
  confidence: number;
  tag: {
    en: string;
  };
}

export const resolvers = {
  Mutation: {
    editPhoto: async (
      _obj: unknown,
      args: EditPhotoArgs,
      { prisma, authService }: AppContext
    ) => {
      authService.assertIsAuthorized();

      const normalizedEdit = await editPhotoInputSchema.validate(args.edit, {
        stripUnknown: true,
      });

      const photo = await prisma.photo.findUnique({
        where: { id: normalizedEdit.photoId },
      });

      if (!photo || !photo.tags) {
        return photo;
      }

      const tags: TagEntry[] = JSON.parse(photo.tags);
      const getlabels: string[] = [];

      tags.forEach((node) => {
        if (node.confidence > 20) {
          getlabels.push(node.tag.en);
        }
      });

      console.log(getlabels.length);

      const updatedPhoto = await prisma.photo.update({
        where: { id: normalizedEdit.photoId },
        data: { labels: getlabels.join(',') },
      });

      return updatedPhoto;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
