### Tech Stack used in this project
 - Nodejs
 - Typesript
 - Redis
 - Socket.io
 - Postgres
 - NestJS

### Application features

- Authentication
  - Login
  - Register
  - Refresh Token
  - Logout (stateful)
- Friend
  - view sent Friend request
  - view recieved Friend request
  - add friend
  - unfriend
  - cancel sent request
  - friend list
- Follow feature
  - follow
  - unfollow
- Post
  - Create
  - Update
  - Delete
  - List
  - My Post
- Comment
  - add comment to post
  - delete comment from post
  - update ccomment
  - get comments for post
  - my comments
- Reactions
  - React comment
  - React post
  - get my reactions
- Realtime updates
  - when a user like / comment post
- User
  - user update
  - me route
  - update profile
  - upload avatar

### How to run project locally
```bash
  $ docker-compose up
  $ npm i && npm run start:dev
```