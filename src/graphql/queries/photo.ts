import type { AppContext } from '../../types/context.js';

export const typeDefs = `#graphql
  extend type Query {
    """
    Returns photo by id or slug.
    """
    photo(id: ID, slug: String): Photo
  }
`;

interface PhotoArgs {
  id?: string;
  slug?: string;
}

export const resolvers = {
  Query: {
    photo: async (
      _obj: unknown,
      args: PhotoArgs,
      { dataLoaders: { photoLoader }, prisma }: AppContext
    ) => {
      // Try by ID first
      if (args.id) {
        return photoLoader.load(args.id);
      }

      // Try by slug
      if (args.slug) {
        const photo = await prisma.photo.findFirst({
          where: { slug: args.slug },
        });
        if (photo) return photo;

        // Fallback: maybe the slug param is actually an old-style ID
        return photoLoader.load(args.slug);
      }

      return null;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
