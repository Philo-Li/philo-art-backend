import { makeExecutableSchema } from '@graphql-tools/schema';
import { merge } from 'lodash-es';

import Photo from './types/Photo.js';
import photoQuery from './queries/photo.js';
import createPhotoMutation from './mutations/createPhoto.js';
import User from './types/User.js';
import createUserMutation from './mutations/createUser.js';
import authorizeMutation from './mutations/authorize.js';
import usersQuery from './queries/users.js';
import authorizedUserQuery from './queries/authorizedUser.js';
import photosQuery from './queries/photos.js';
import PageInfo from './types/PageInfo.js';
import PhotoConnection from './types/PhotoConnection.js';
import OrderDirection from './enums/OrderDirection.js';
import createCollectionMutation from './mutations/createCollection.js';
import Collection from './types/Collection.js';
import CollectionConnection from './types/CollectionConnection.js';
import collectionQuery from './queries/collection.js';
import collectionsQuery from './queries/collections.js';
import deleteCollectionMutation from './mutations/deleteCollection.js';
import CollectedPhoto from './types/CollectedPhoto.js';
import CollectedPhotoConnection from './types/CollectedPhotoConnection.js';
import collectPhotoMutation from './mutations/collectPhoto.js';
import createCollectionAndCollectPhotoMutation from './mutations/createCollectionAndCollectPhoto.js';
import deleteCollectedPhotoMutation from './mutations/deleteCollectedPhoto.js';
import Follow from './types/Follow.js';
import FollowConnection from './types/FollowConnection.js';
import Like from './types/Like.js';
import LikeConnection from './types/LikeConnection.js';
import likesQuery from './queries/likes.js';
import isLikedPhotoQuery from './queries/isLikedPhoto.js';
import likePhotoMutation from './mutations/likePhoto.js';
import unlikePhotoMutation from './mutations/unlikePhoto.js';
import followUserMutation from './mutations/followUser.js';
import unfollowUserMutation from './mutations/unfollowUser.js';
import downloadPhotoMutation from './mutations/downloadPhoto.js';
import deletePhotoMutation from './mutations/deletePhoto.js';
import UserConnection from './types/UserConnection.js';
import PhotoReview from './types/PhotoReview.js';
import PhotoReviewConnection from './types/PhotoReviewConnection.js';
import createPhotoReviewMutation from './mutations/createPhotoReview.js';
import deletePhotoReviewMutation from './mutations/deletePhotoReview.js';
import CollectionReview from './types/CollectionReview.js';
import CollectionReviewConnection from './types/CollectionReviewConnection.js';
import createCollectionReviewMutation from './mutations/createCollectionReview.js';
import deleteCollectionReviewMutation from './mutations/deleteCollectionReview.js';
import photosInCollectionQuery from './queries/photosInCollection.js';
import collectedPhotosQuery from './queries/collectedPhotos.js';
import DateTime from './scalars/DateTime.js';
import JSON from './scalars/JSON.js';
import editPhotosLabelMutation from './mutations/editPhotosLabel.js';
import updateUserProfileMutation from './mutations/updateUserProfile.js';
import deleteUserMutation from './mutations/deleteUser.js';
import changePasswordMutation from './mutations/changePassword.js';
import createAndLikePhotoMutation from './mutations/createAndLikePhoto.js';
import unlikeAndDeletePhotoMutation from './mutations/unlikeAndDeletePhoto.js';
import editCollectionMutation from './mutations/editCollection.js';
import Email from './types/Email.js';
import Information from './types/Information.js';
import createInformationMutation from './mutations/createInformation.js';
import informationQuery from './queries/information.js';
import s3UrlQuery from './queries/s3Url.js';
import updateAvatar from './mutations/updateAvatar.js';
import userQuery from './queries/user.js';
import updatePhotoMutation from './mutations/updatePhoto.js';

const rootTypeDefs = `#graphql
  type Query {
    root: String
  }

  type Mutation {
    root: String
  }
`;

const typeDefs = [
  rootTypeDefs,
  DateTime.typeDefs,
  JSON.typeDefs,
  Photo.typeDefs,
  photoQuery.typeDefs,
  createPhotoMutation.typeDefs,
  User.typeDefs,
  UserConnection.typeDefs,
  createUserMutation.typeDefs,
  authorizeMutation.typeDefs,
  usersQuery.typeDefs,
  authorizedUserQuery.typeDefs,
  photosQuery.typeDefs,
  PageInfo.typeDefs,
  PhotoConnection.typeDefs,
  OrderDirection.typeDefs,
  createCollectionMutation.typeDefs,
  Collection.typeDefs,
  CollectionConnection.typeDefs,
  collectionQuery.typeDefs,
  collectionsQuery.typeDefs,
  deleteCollectionMutation.typeDefs,
  CollectedPhoto.typeDefs,
  CollectedPhotoConnection.typeDefs,
  collectPhotoMutation.typeDefs,
  createCollectionAndCollectPhotoMutation.typeDefs,
  deleteCollectedPhotoMutation.typeDefs,
  Follow.typeDefs,
  FollowConnection.typeDefs,
  Like.typeDefs,
  LikeConnection.typeDefs,
  likesQuery.typeDefs,
  isLikedPhotoQuery.typeDefs,
  likePhotoMutation.typeDefs,
  unlikePhotoMutation.typeDefs,
  followUserMutation.typeDefs,
  unfollowUserMutation.typeDefs,
  downloadPhotoMutation.typeDefs,
  deletePhotoMutation.typeDefs,
  PhotoReview.typeDefs,
  PhotoReviewConnection.typeDefs,
  createPhotoReviewMutation.typeDefs,
  deletePhotoReviewMutation.typeDefs,
  CollectionReview.typeDefs,
  CollectionReviewConnection.typeDefs,
  createCollectionReviewMutation.typeDefs,
  deleteCollectionReviewMutation.typeDefs,
  photosInCollectionQuery.typeDefs,
  collectedPhotosQuery.typeDefs,
  editPhotosLabelMutation.typeDefs,
  updateUserProfileMutation.typeDefs,
  deleteUserMutation.typeDefs,
  changePasswordMutation.typeDefs,
  createAndLikePhotoMutation.typeDefs,
  unlikeAndDeletePhotoMutation.typeDefs,
  editCollectionMutation.typeDefs,
  Email.typeDefs,
  Information.typeDefs,
  createInformationMutation.typeDefs,
  informationQuery.typeDefs,
  s3UrlQuery.typeDefs,
  updateAvatar.typeDefs,
  userQuery.typeDefs,
  updatePhotoMutation.typeDefs,
];

const resolvers = merge(
  DateTime.resolvers,
  JSON.resolvers,
  Photo.resolvers,
  photoQuery.resolvers,
  createPhotoMutation.resolvers,
  User.resolvers,
  UserConnection.resolvers,
  createUserMutation.resolvers,
  authorizeMutation.resolvers,
  usersQuery.resolvers,
  authorizedUserQuery.resolvers,
  photosQuery.resolvers,
  PageInfo.resolvers,
  PhotoConnection.resolvers,
  OrderDirection.resolvers,
  createCollectionMutation.resolvers,
  createCollectionAndCollectPhotoMutation.resolvers,
  Collection.resolvers,
  CollectionConnection.resolvers,
  collectionQuery.resolvers,
  collectionsQuery.resolvers,
  deleteCollectionMutation.resolvers,
  CollectedPhoto.resolvers,
  CollectedPhotoConnection.resolvers,
  collectPhotoMutation.resolvers,
  deleteCollectedPhotoMutation.resolvers,
  Follow.resolvers,
  FollowConnection.resolvers,
  Like.resolvers,
  LikeConnection.resolvers,
  likesQuery.resolvers,
  isLikedPhotoQuery.resolvers,
  likePhotoMutation.resolvers,
  unlikePhotoMutation.resolvers,
  followUserMutation.resolvers,
  unfollowUserMutation.resolvers,
  downloadPhotoMutation.resolvers,
  deletePhotoMutation.resolvers,
  PhotoReview.resolvers,
  PhotoReviewConnection.resolvers,
  createPhotoReviewMutation.resolvers,
  deletePhotoReviewMutation.resolvers,
  CollectionReview.resolvers,
  CollectionReviewConnection.resolvers,
  createCollectionReviewMutation.resolvers,
  deleteCollectionReviewMutation.resolvers,
  photosInCollectionQuery.resolvers,
  collectedPhotosQuery.resolvers,
  editPhotosLabelMutation.resolvers,
  updateUserProfileMutation.resolvers,
  deleteUserMutation.resolvers,
  changePasswordMutation.resolvers,
  createAndLikePhotoMutation.resolvers,
  unlikeAndDeletePhotoMutation.resolvers,
  editCollectionMutation.resolvers,
  Email.resolvers,
  Information.resolvers,
  createInformationMutation.resolvers,
  informationQuery.resolvers,
  s3UrlQuery.resolvers,
  updateAvatar.resolvers,
  userQuery.resolvers,
  updatePhotoMutation.resolvers
);

const createSchema = () => {
  return makeExecutableSchema({
    typeDefs,
    resolvers,
  });
};

export default createSchema;
