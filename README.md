# Picky Api

This is a GraphQL API for Picky application. The relative React web app is here: [Picky](https://github.com/LulalaP/picky)

## ✔️ Requirements

Node (versions `12.X.X` are tested, but later versions _might_ work as well) and npm. If you haven't installed Node or npm, [nvm](https://github.com/nvm-sh/nvm) is an easy to use tool for installing both. Nvm is also handy if you want to quickly switch between different Node versions.

## 🚀 Getting started

1. Clone this repository and run `npm install` in the ``picky-api`` directory.

3. Create a file `.env` in the `picky-api` directory and copy the contents of the `.env.template` file there. 

4. Run `npm run build`. This will setup the SQLite database and run the migrations.

6. All done! Just run `npm start` to start the server. After the server has started you should be able to access the GraphQL playground at http://localhost:5000/graphql.

## 🔑 Authorization

To list all the registered users, you can run this query in the GraphQL playground:

```javascript
{
  users {
    edges {
      node {
        username
      }
    }
  }
}
```

You can retrieve an access token by performing the `authorize` mutation:

```javascript
mutation {
  authorize(credentials: { username: "kalle", password: "yourpassword" }) {
    accessToken
  }
}
```

You can also register a new user by performing the `createUser` mutation:

```javascript
mutation {
  createUser(user: { username: "myusername", password: "mypassword" }) {
    id
    username
  }
}
```

### Authorize requests in the GraphQL playground

A handy way to authorize requests in the GraphQL playground is to retrieve an access token using the `authorize` mutation (see above for details) and then add the following in the "HTTP HEADERS" tab below the query editor:

```json
{
  "Authorization": "Bearer <ACCESS_TOKEN>"
}
```

Replace the `<ACCESS_TOKEN>` part with your access token.

## 📖 Documentation

GraphQL playground offers documentation on how to use the API. Start the server by running `npm start`, open the GraphQL playground at http://localhost:5000/graphql and click the "docs" tab.

## 🐛 Found a bug?

Submit an issue with the bug description and a way to reproduce the bug. If you have already come up with a solution, we will gladly accept a pull request.
