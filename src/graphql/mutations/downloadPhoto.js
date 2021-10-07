import { gql, UserInputError } from 'apollo-server';
import { nanoid } from 'nanoid';

export const typeDefs = gql`
  extend type Mutation {
    """
    Downloads the photo which has the given id.
    """
    downloadPhoto(id: ID!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    downloadPhoto: async (obj, args, { models: { Photo, Information } }) => {
      const photo = await Photo.query().findById(args.id);

      if (!photo) {
        throw new UserInputError(`Photo with id ${args.id} does not exist`);
      }

      const count = parseInt(photo.downloadCount, 10) + 1;

      await Photo.query()
        .where({ id: args.id })
        .update({ downloadCount: count });

      let downloadCount = 1;

      const findDownloadCount = await Information.query().findOne({
        name: "download_count",
      })
      
      if (findDownloadCount) {
        downloadCount = parseInt(findDownloadCount.value, 10) + 1;
        await Information.query()
          .where({ id: findDownloadCount.id })
          .update({ value: downloadCount });
      } else {
        await Information.query().insert({
          id: nanoid(),
          name: "download_count",
          value: downloadCount,
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
