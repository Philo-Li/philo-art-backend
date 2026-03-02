// ==================== Authentication ====================

export const CREATE_USER = `
  mutation CreateUser($user: CreateUserInput!) {
    createUser(user: $user) {
      id
      username
      email
      firstName
      lastName
    }
  }
`;

export const AUTHORIZE = `
  mutation Authorize($credentials: AuthorizeInput!) {
    authorize(credentials: $credentials) {
      user {
        id
        username
        email
        firstName
        lastName
      }
      accessToken
      expiresAt
    }
  }
`;

export const CHANGE_PASSWORD = `
  mutation ChangePassword($user: changePasswordInput!) {
    changePassword(user: $user)
  }
`;

// ==================== Users ====================

export const USERS = `
  query Users($first: Int, $after: String) {
    users(first: $first, after: $after) {
      edges {
        node {
          id
          username
          firstName
          lastName
          email
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
        totalCount
      }
    }
  }
`;

export const USER = `
  query User($username: String!) {
    user(username: $username) {
      id
      username
      firstName
      lastName
      email
      description
      socialMediaLink
      profileImage
    }
  }
`;

export const AUTHORIZED_USER = `
  query AuthorizedUser {
    authorizedUser {
      id
      username
      firstName
      lastName
      email
      description
      socialMediaLink
      profileImage
    }
  }
`;

export const UPDATE_USER_PROFILE = `
  mutation UpdateUserProfile($user: UpdateUserProfileInput!) {
    updateUserProfile(user: $user) {
      id
      username
      firstName
      lastName
      email
      description
    }
  }
`;

// ==================== Photos ====================

export const PHOTOS = `
  query Photos($first: Int, $after: String, $searchKeyword: String, $userId: String, $username: String) {
    photos(first: $first, after: $after, searchKeyword: $searchKeyword, userId: $userId, username: $username) {
      edges {
        node {
          id
          title
          year
          description
          srcTiny
          srcSmall
          srcLarge
          srcOriginal
          type
          status
          allowDownload
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
        totalCount
      }
    }
  }
`;

export const PHOTO = `
  query Photo($id: ID!) {
    photo(id: $id) {
      id
      title
      year
      description
      srcTiny
      srcSmall
      srcLarge
      srcOriginal
      type
      status
      allowDownload
      user {
        id
        username
      }
    }
  }
`;

export const CREATE_PHOTO = `
  mutation CreatePhoto($photo: CreatePhotoInput!) {
    createPhoto(photo: $photo) {
      id
      title
      year
      description
      type
      status
      allowDownload
    }
  }
`;

export const UPDATE_PHOTO = `
  mutation UpdatePhoto($photo: UpdatePhotoInput!) {
    updatePhoto(photo: $photo) {
      id
      title
      description
      tags
      license
    }
  }
`;

export const DELETE_PHOTO = `
  mutation DeletePhoto($id: ID!) {
    deletePhoto(id: $id)
  }
`;

// ==================== Collections ====================

export const COLLECTIONS = `
  query Collections($first: Int, $after: String, $userId: String) {
    collections(first: $first, after: $after, userId: $userId) {
      edges {
        node {
          id
          title
          description
          cover
          public
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
        totalCount
      }
    }
  }
`;

export const COLLECTION = `
  query Collection($id: ID!) {
    collection(id: $id) {
      id
      title
      description
      cover
      public
      user {
        id
        username
      }
    }
  }
`;

export const CREATE_COLLECTION = `
  mutation CreateCollection($collection: CreateCollectionInput!) {
    createCollection(collection: $collection) {
      id
      title
      description
      public
    }
  }
`;

export const EDIT_COLLECTION = `
  mutation EditCollection($id: ID!, $title: String, $description: String, $public: Boolean) {
    editCollection(id: $id, title: $title, description: $description, public: $public) {
      id
      title
      description
      public
    }
  }
`;

export const DELETE_COLLECTION = `
  mutation DeleteCollection($id: ID!) {
    deleteCollection(id: $id)
  }
`;

export const COLLECT_PHOTO = `
  mutation CollectPhoto($collect: CollectPhotoInput!) {
    collectPhoto(collect: $collect) {
      id
      photo {
        id
        title
      }
      collection {
        id
        title
      }
    }
  }
`;

export const DELETE_COLLECTED_PHOTO = `
  mutation DeleteCollectedPhoto($photoId: ID!, $collectionId: ID!) {
    deleteCollectedPhoto(photoId: $photoId, collectionId: $collectionId)
  }
`;

export const PHOTOS_IN_COLLECTION = `
  query PhotosInCollection($id: ID!, $first: Int, $after: String) {
    photosInCollection(id: $id, first: $first, after: $after) {
      edges {
        node {
          id
          photo {
            id
            title
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
        totalCount
      }
    }
  }
`;

// ==================== Social (Likes) ====================

export const LIKE_PHOTO = `
  mutation LikePhoto($photoId: ID!) {
    likePhoto(photoId: $photoId) {
      id
      photo {
        id
        title
      }
      user {
        id
        username
      }
    }
  }
`;

export const UNLIKE_PHOTO = `
  mutation UnlikePhoto($photoId: ID!) {
    unlikePhoto(photoId: $photoId)
  }
`;

export const IS_LIKED_PHOTO = `
  query IsLikedPhoto($photoId: ID!) {
    isLikedPhoto(photoId: $photoId)
  }
`;

export const LIKES = `
  query Likes($first: Int, $after: String, $userId: String) {
    likes(first: $first, after: $after, userId: $userId) {
      edges {
        node {
          id
          photo {
            id
            title
          }
          user {
            id
            username
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
        totalCount
      }
    }
  }
`;

// ==================== Social (Follows) ====================

export const FOLLOW_USER = `
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId)
  }
`;

export const UNFOLLOW_USER = `
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId)
  }
`;

// ==================== Reviews ====================

export const CREATE_PHOTO_REVIEW = `
  mutation CreatePhotoReview($photoReview: CreatePhotoReviewInput!) {
    createPhotoReview(photoReview: $photoReview) {
      id
      text
      photo {
        id
        title
      }
      user {
        id
        username
      }
    }
  }
`;

export const DELETE_PHOTO_REVIEW = `
  mutation DeletePhotoReview($id: ID!) {
    deletePhotoReview(id: $id)
  }
`;

export const CREATE_COLLECTION_REVIEW = `
  mutation CreateCollectionReview($collectionReview: CreateCollectionReviewInput!) {
    createCollectionReview(collectionReview: $collectionReview) {
      id
      text
      collection {
        id
        title
      }
      user {
        id
        username
      }
    }
  }
`;

export const DELETE_COLLECTION_REVIEW = `
  mutation DeleteCollectionReview($id: ID!) {
    deleteCollectionReview(id: $id)
  }
`;
