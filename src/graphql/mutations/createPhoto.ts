import * as yup from 'yup';
import { nanoid } from 'nanoid';
import type { AppContext } from '../../types/context.js';
import { analyzeImage } from '../../services/qwenVisionClient.js';

export const typeDefs = `#graphql
  input CreatePhotoInput {
    photoId: String
    title: String!
    year: Int!
    description: String
    imageKey: String!
    srcOriginal: String!
    srcLarge: String!
    srcSmall: String!
    srcTiny: String!
    srcYoutube: String
    license: String
    type: String
    status: String
    allowDownload: Boolean!
  }

  extend type Mutation {
    """
    Create a new photo.
    """
    createPhoto(photo: CreatePhotoInput): Photo
  }
`;

const createPhotoInputSchema = yup.object().shape({
  photoId: yup.string().trim(),
  title: yup.string().required().trim(),
  year: yup.string().required().trim(),
  tags: yup.string().trim(),
  description: yup.string().trim(),
  imageKey: yup.string().required().trim(),
  srcOriginal: yup.string().required().trim(),
  srcLarge: yup.string().required().trim(),
  srcSmall: yup.string().required().trim(),
  srcTiny: yup.string().required().trim(),
  srcYoutube: yup.string().trim(),
  license: yup.string().trim(),
  type: yup.string().trim(),
  status: yup.string().trim(),
  allowDownload: yup.boolean().required(),
});

interface CreatePhotoArgs {
  photo: {
    photoId?: string;
    title: string;
    year: number;
    description?: string;
    imageKey: string;
    srcOriginal: string;
    srcLarge: string;
    srcSmall: string;
    srcTiny: string;
    srcYoutube?: string;
    license?: string;
    type?: string;
    status?: string;
    allowDownload: boolean;
  };
}

export const resolvers = {
  Mutation: {
    createPhoto: async (
      _obj: unknown,
      args: CreatePhotoArgs,
      { prisma, authService }: AppContext
    ) => {
      const userId = authService.assertIsAuthorized();

      const normalizedPhoto = await createPhotoInputSchema.validate(
        args.photo,
        {
          stripUnknown: true,
        }
      );

      // 使用 Qwen-VL 分析图片，提取描述、多语言标签和颜色
      const { srcOriginal } = normalizedPhoto;
      const analysisResult = await analyzeImage(srcOriginal as string);

      // 使用 AI 生成的描述，如果用户没有提供的话
      const finalDescription =
        normalizedPhoto.description ||
        `${analysisResult.descriptionEn}\n\n${analysisResult.descriptionZh}`;

      // 标签存储：
      // - tags: 英文标签（主要用于搜索）
      // - labels: 中文标签
      // - allTags: 日文标签 + 所有语言合并（用于扩展搜索）
      const tagsEn = analysisResult.tagsEn.join(',');
      const tagsZh = analysisResult.tagsZh.join(',');
      const allTagsCombined = [
        ...analysisResult.tagsEn,
        ...analysisResult.tagsZh,
        ...analysisResult.tagsJa,
      ].join(',');

      const id = normalizedPhoto.photoId || nanoid();

      // Use pre-processed URLs from the upload endpoint
      const photo = await prisma.photo.create({
        data: {
          id,
          userId,
          title: normalizedPhoto.title,
          year: Number(normalizedPhoto.year),
          description: finalDescription,
          imageKey: normalizedPhoto.imageKey,
          srcTiny: normalizedPhoto.srcTiny,
          srcSmall: normalizedPhoto.srcSmall,
          srcLarge: normalizedPhoto.srcLarge,
          srcOriginal: normalizedPhoto.srcOriginal,
          srcYoutube: normalizedPhoto.srcYoutube,
          color: analysisResult.dominantColor,
          allColors: analysisResult.allColors.join(','),
          creditId: id,
          license: normalizedPhoto.license,
          type: normalizedPhoto.type,
          status: normalizedPhoto.status,
          allowDownload: normalizedPhoto.allowDownload,
          tags: tagsEn,
          labels: tagsZh,
          allTags: allTagsCombined,
          downloadCount: '0',
        },
      });

      return photo;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
