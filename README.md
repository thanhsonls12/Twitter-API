# Twitter Clone API Server

Backend API cho ứng dụng Twitter Clone, xây dựng bằng Node.js, Express, TypeScript, MongoDB và Socket.IO. Dự án cung cấp các chức năng xác thực, hồ sơ người dùng, tweet, tương tác like/bookmark, Twitter Circle, tìm kiếm, upload media, chuyển mã video HLS và chat realtime.

## Mục Lục

- [Tính Năng](#tính-năng)
- [Công Nghệ](#công-nghệ)
- [Yêu Cầu](#yêu-cầu)
- [Cài Đặt](#cài-đặt)
- [Biến Môi Trường](#biến-môi-trường)
- [Chạy Dự Án](#chạy-dự-án)
- [Tài Liệu API](#tài-liệu-api)
- [Xác Thực](#xác-thực)
- [Endpoint Tổng Quan](#endpoint-tổng-quan)
- [Ví Dụ Request](#ví-dụ-request)
- [Upload Media Và HLS](#upload-media-và-hls)
- [Socket.IO Chat](#socketio-chat)
- [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
- [Scripts](#scripts)
- [Ghi Chú Vận Hành](#ghi-chú-vận-hành)

## Tính Năng

- Đăng ký, đăng nhập, đăng xuất, refresh token bằng JWT.
- Xác minh email, gửi lại email xác minh, quên mật khẩu và đặt lại mật khẩu qua SMTP.
- Đăng nhập Google OAuth 2.0.
- Quản lý hồ sơ cá nhân: tên, ngày sinh, bio, location, website, username, avatar, cover photo.
- Follow/unfollow người dùng.
- Tạo, xem, xóa tweet; hỗ trợ tweet thường, retweet, comment và quote tweet.
- Twitter Circle cho tweet giới hạn người xem.
- News feed theo danh sách follow.
- Like và bookmark tweet.
- Tìm kiếm user và tweet bằng MongoDB text index.
- Upload ảnh, video thường và video HLS lên Supabase Storage.
- Queue chuyển mã video sang HLS bằng FFmpeg/FFprobe.
- Chat realtime qua Socket.IO với lưu message vào MongoDB.
- Swagger UI và file OpenAPI JSON có sẵn.
- Helmet, CORS, validation, xử lý lỗi tập trung và rate limit cho auth.

## Công Nghệ

- Runtime: Node.js, ESM
- Language: TypeScript
- Framework: Express 5
- Database: MongoDB native driver
- Realtime: Socket.IO
- Authentication: JWT, Passport Google OAuth 2.0
- Validation: express-validator
- Upload: formidable, sharp, file-type
- Storage: Supabase Storage
- Email: Nodemailer SMTP
- Video processing: FFmpeg, FFprobe, HLS
- API docs: swagger-ui-express
- Quality: ESLint, Prettier

## Yêu Cầu

- Node.js 20+ khuyến nghị.
- npm.
- MongoDB local hoặc MongoDB Atlas.
- Supabase project có bucket public `images` và `videos`.
- SMTP account để gửi email xác minh/quên mật khẩu.
- Google OAuth credentials nếu dùng đăng nhập Google.
- FFmpeg và FFprobe trong `PATH` nếu dùng upload video HLS.

## Cài Đặt

```bash
npm install
```

Tạo file `.env` ở root project. File này đã được `.gitignore`, không commit secret lên repository.

```bash
cp .env.example .env
```

Nếu chưa có `.env.example`, dùng mẫu ở phần [Biến Môi Trường](#biến-môi-trường) và thay bằng giá trị thật.

## Biến Môi Trường

Các biến sau được kiểm tra khi server khởi động. Nếu thiếu biến bắt buộc, app sẽ throw error và dừng.

```env
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb://127.0.0.1:27017
DB_NAME=twitter_clone
USERS_COLLECTION=users
REFRESH_TOKENS_COLLECTION=refresh_tokens
FOLLOWS_COLLECTION=follows
VIDEO_STATUS_COLLECTION=video_status
TWEETS_COLLECTION=tweets
HASHTAGS_COLLECTION=hashtags
BOOKMARKS_COLLECTION=bookmarks
LIKES_COLLECTION=likes
CONVERSATIONS_COLLECTION=conversations
MESSAGES_COLLECTION=messages
EXPIRE_AFTER_SECONDS=604800

JWT_SECRET_ACCESS_TOKEN=replace_with_access_secret
JWT_SECRET_REFRESH_TOKEN=replace_with_refresh_secret
JWT_SECRET_VERIFY_EMAIL_TOKEN=replace_with_verify_email_secret
JWT_SECRET_FORGOT_PASSWORD_TOKEN=replace_with_forgot_password_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
EMAIL_VERIFY_TOKEN_EXPIRES_IN=15m
FORGOT_PASSWORD_TOKEN_EXPIRES_IN=15m

GOOGLE_CLIENT_ID=replace_with_google_client_id
GOOGLE_CLIENT_SECRET=replace_with_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/users/oauth/google/callback

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=no-reply@example.com
SMTP_PASSWORD=replace_with_smtp_password

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace_with_service_role_key
```

| Biến                        | Bắt buộc | Ghi chú                                                          |
| --------------------------- | -------- | ---------------------------------------------------------------- |
| `PORT`                      | Không    | Mặc định `3000`.                                                 |
| `NODE_ENV`                  | Không    | Mặc định `development`.                                          |
| `BASE_URL`                  | Không    | Mặc định `http://localhost:${PORT}`.                             |
| `CLIENT_URL`                | Có       | Origin CORS và redirect email/OAuth.                             |
| `MONGO_URI`                 | Có       | Connection string MongoDB.                                       |
| `DB_NAME`                   | Có       | Tên database.                                                    |
| `*_COLLECTION`              | Có       | Tên các collection MongoDB.                                      |
| `EXPIRE_AFTER_SECONDS`      | Có       | TTL index cho refresh token, phải là số.                         |
| `JWT_SECRET_*`              | Có       | Secret ký từng loại JWT.                                         |
| `*_EXPIRES_IN`              | Có       | Thời hạn token theo định dạng `jsonwebtoken`, ví dụ `15m`, `7d`. |
| `GOOGLE_CLIENT_ID`          | Có       | Client ID Google OAuth.                                          |
| `GOOGLE_CLIENT_SECRET`      | Có       | Client secret Google OAuth.                                      |
| `GOOGLE_CALLBACK_URL`       | Có       | Callback URL đã khai báo trong Google Console.                   |
| `SMTP_*`                    | Có       | Cấu hình gửi email bằng Nodemailer.                              |
| `SUPABASE_URL`              | Có       | URL Supabase project.                                            |
| `SUPABASE_SERVICE_ROLE_KEY` | Có       | Service role key cho upload storage. Giữ bí mật.                 |

## Chạy Dự Án

Chạy development với hot reload:

```bash
npm run dev
```

Build TypeScript:

```bash
npm run build
```

Chạy production sau khi build:

```bash
node dist/index.js --production
```

Lưu ý: script `npm run start` hiện đang được khai báo là `node dist/index.ts --production` trong `package.json`. Sau khi `tsc` build, output thông thường là `dist/index.js`, nên lệnh production khuyến nghị là lệnh trực tiếp ở trên hoặc cập nhật script `start` cho phù hợp.

Server mặc định chạy tại:

```text
http://localhost:3000
```

## Tài Liệu API

Khi server đang chạy:

- Swagger UI: `GET /api-docs`
- OpenAPI JSON: `GET /swagger.json`

Ví dụ local:

```text
http://localhost:3000/api-docs
http://localhost:3000/swagger.json
```

## Xác Thực

Các endpoint cần đăng nhập sử dụng Bearer token:

```http
Authorization: Bearer <access_token>
```

Nhiều endpoint ghi dữ liệu yêu cầu user đã xác minh email (`verify = 1`). Các endpoint auth như `register`, `login` và `forgot-password` có rate limit `10` request trong `15` phút cho mỗi IP.

## Endpoint Tổng Quan

### Auth Và Users

| Method   | Endpoint                              | Mô tả                                         | Auth          |
| -------- | ------------------------------------- | --------------------------------------------- | ------------- |
| `POST`   | `/users/register`                     | Đăng ký tài khoản.                            | Không         |
| `POST`   | `/users/login`                        | Đăng nhập, trả access token và refresh token. | Không         |
| `POST`   | `/users/logout`                       | Đăng xuất và thu hồi refresh token.           | Có            |
| `POST`   | `/users/refresh-token`                | Cấp lại token pair.                           | Refresh token |
| `POST`   | `/users/verify-email`                 | Xác minh email bằng token.                    | Refresh token |
| `POST`   | `/users/resend-verify-email`          | Gửi lại email xác minh.                       | Có            |
| `POST`   | `/users/forgot-password`              | Gửi email quên mật khẩu.                      | Không         |
| `POST`   | `/users/verify-forgot-password-token` | Kiểm tra token quên mật khẩu.                 | Không         |
| `POST`   | `/users/reset-password`               | Đặt lại mật khẩu.                             | Không         |
| `GET`    | `/users/oauth/google`                 | Bắt đầu Google OAuth.                         | Không         |
| `GET`    | `/users/oauth/google/callback`        | Callback Google OAuth.                        | Không         |
| `GET`    | `/users/me`                           | Lấy thông tin tài khoản hiện tại.             | Có            |
| `PATCH`  | `/users/me`                           | Cập nhật hồ sơ cá nhân.                       | Có, verified  |
| `PUT`    | `/users/change-password`              | Đổi mật khẩu.                                 | Có, verified  |
| `GET`    | `/users/:username`                    | Lấy profile public theo username.             | Không         |
| `POST`   | `/users/:user_id/follow`              | Follow user.                                  | Có, verified  |
| `DELETE` | `/users/:user_id/follow`              | Unfollow user.                                | Có, verified  |

### Tweets

| Method   | Endpoint                     | Mô tả                                         | Auth         |
| -------- | ---------------------------- | --------------------------------------------- | ------------ |
| `POST`   | `/tweets`                    | Tạo tweet, retweet, comment hoặc quote tweet. | Có, verified |
| `GET`    | `/tweets/new-feeds`          | Lấy news feed.                                | Có, verified |
| `GET`    | `/tweets/:tweet_id`          | Lấy chi tiết tweet, có kiểm tra audience.     | Optional     |
| `DELETE` | `/tweets/:tweet_id`          | Xóa tweet của user hiện tại.                  | Có, verified |
| `GET`    | `/tweets/:tweet_id/children` | Lấy comment/retweet/quote tweet con.          | Optional     |

Query phổ biến: `page`, `limit`. Endpoint children hỗ trợ thêm `type`.

### Media Và Static Files

| Method | Endpoint                   | Mô tả                                                   | Auth         |
| ------ | -------------------------- | ------------------------------------------------------- | ------------ |
| `POST` | `/medias/upload-image`     | Upload ảnh qua multipart field `image`.                 | Có, verified |
| `POST` | `/medias/upload-video`     | Upload video qua multipart field `video`.               | Có, verified |
| `POST` | `/medias/upload-video-hls` | Upload video và đưa vào queue chuyển HLS.               | Có, verified |
| `GET`  | `/medias/video-status/:id` | Lấy trạng thái encode HLS.                              | Có, verified |
| `GET`  | `/images/:filename`        | Serve ảnh local trong `uploads/images`.                 | Không        |
| `GET`  | `/videos/:filename`        | Stream video local, cần header `Range`.                 | Không        |
| `GET`  | `/videos/*`                | Serve file HLS `.m3u8` và `.ts` trong `uploads/videos`. | Không        |

### Bookmarks

| Method   | Endpoint               | Mô tả                                            | Auth         |
| -------- | ---------------------- | ------------------------------------------------ | ------------ |
| `GET`    | `/bookmarks`           | Lấy danh sách bookmark của user hiện tại.        | Có, verified |
| `POST`   | `/bookmarks`           | Bookmark tweet với body `{ "tweet_id": "..." }`. | Có, verified |
| `DELETE` | `/bookmarks/:tweet_id` | Bỏ bookmark tweet.                               | Có, verified |

### Likes

| Method   | Endpoint           | Mô tả                                        | Auth         |
| -------- | ------------------ | -------------------------------------------- | ------------ |
| `GET`    | `/likes`           | Lấy danh sách tweet đã like.                 | Có, verified |
| `POST`   | `/likes`           | Like tweet với body `{ "tweet_id": "..." }`. | Có, verified |
| `DELETE` | `/likes/:tweet_id` | Unlike tweet.                                | Có, verified |

### Twitter Circle

| Method   | Endpoint                   | Mô tả                                                         | Auth         |
| -------- | -------------------------- | ------------------------------------------------------------- | ------------ |
| `POST`   | `/twitter-circle`          | Thêm user vào Twitter Circle với body `{ "user_id": "..." }`. | Có, verified |
| `DELETE` | `/twitter-circle/:user_id` | Xóa user khỏi Twitter Circle.                                 | Có, verified |

### Search

| Method | Endpoint         | Mô tả                                     | Auth     |
| ------ | ---------------- | ----------------------------------------- | -------- |
| `GET`  | `/search/users`  | Tìm user theo `q`.                        | Không    |
| `GET`  | `/search/tweets` | Tìm tweet theo `q`, có kiểm tra audience. | Optional |

Query hỗ trợ: `q`, `page`, `limit`, `media_type`, `people_follow`.

### Conversations

| Method | Endpoint                                   | Mô tả                                                          | Auth         |
| ------ | ------------------------------------------ | -------------------------------------------------------------- | ------------ |
| `GET`  | `/conversations`                           | Lấy danh sách conversation của user hiện tại.                  | Có, verified |
| `POST` | `/conversations`                           | Tạo hoặc lấy conversation với body `{ "receiver_id": "..." }`. | Có, verified |
| `GET`  | `/conversations/:conversation_id/messages` | Lấy message theo cursor pagination.                            | Có, verified |

Query message: `limit`, `cursor`.

## Ví Dụ Request

### Đăng Ký

```http
POST /users/register
Content-Type: application/json
```

```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "password": "Password1!",
  "confirm_password": "Password1!",
  "date_of_birth": "2000-01-01"
}
```

Mật khẩu phải có tối thiểu 6 ký tự và gồm chữ thường, chữ hoa, số, ký tự đặc biệt.

### Đăng Nhập

```http
POST /users/login
Content-Type: application/json
```

```json
{
  "email": "a@example.com",
  "password": "Password1!"
}
```

Response trả về `data.user_id`, `data.access_token`, `data.refresh_token`.

### Tạo Tweet

```http
POST /tweets
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "type": 0,
  "audience": 0,
  "content": "Hello Twitter Clone",
  "parent_id": null,
  "hashtags": ["nodejs", "typescript"],
  "mentions": [],
  "medias": []
}
```

Enum liên quan:

| Enum               | Giá trị                                                  |
| ------------------ | -------------------------------------------------------- |
| `TweetType`        | `0`: Tweet, `1`: Retweet, `2`: Comment, `3`: QuoteTweet  |
| `TweetAudience`    | `0`: Everyone, `1`: TwitterCircle                        |
| `MediaType`        | `0`: Image, `1`: Video, `2`: VideoHLS                    |
| `EncodingStatus`   | `0`: Pending, `1`: Processing, `2`: Success, `3`: Failed |
| `UserVerifyStatus` | `0`: Unverified, `1`: Verified, `2`: Banned              |

### Upload Ảnh

```http
POST /medias/upload-image
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

Form-data:

```text
image=<file>
```

### Tìm Kiếm Tweet

```http
GET /search/tweets?q=nodejs&page=1&limit=20
Authorization: Bearer <access_token>
```

Header `Authorization` là optional cho endpoint này, nhưng nếu có token server sẽ dùng để kiểm tra nội dung giới hạn audience.

## Upload Media Và HLS

- Ảnh dùng multipart field `image`, tối đa `4` file, mỗi file tối đa `300KB`.
- Ảnh được convert sang JPEG bằng `sharp`, upload lên Supabase bucket `images` và xóa file tạm local.
- Video dùng multipart field `video`, tối đa `4` file, mỗi file tối đa `50MB`.
- Video thường chấp nhận MIME `video/mp4`, `video/webm`, `video/quicktime`, upload lên Supabase bucket `videos`.
- Video HLS được đưa vào queue, encode bằng FFmpeg/FFprobe thành nhiều stream HLS, upload folder HLS lên bucket `videos`, rồi xóa file tạm local.
- Trạng thái HLS lưu trong collection cấu hình bởi `VIDEO_STATUS_COLLECTION`.
- Kiểm tra trạng thái bằng `GET /medias/video-status/:id`, trong đó `id` là tên file không có phần mở rộng trong URL HLS trả về.

## Socket.IO Chat

Socket.IO chạy cùng HTTP server và dùng `CLIENT_URL` cho CORS.

Kết nối client:

```ts
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
  auth: {
    token: accessToken
  },
  withCredentials: true
})
```

Server yêu cầu `handshake.auth.token` là access token hợp lệ.

Events:

| Hướng            | Event               | Payload                        | Mô tả                                          |
| ---------------- | ------------------- | ------------------------------ | ---------------------------------------------- |
| Client -> Server | `chat:send_message` | `{ conversation_id, content }` | Gửi message và lưu vào MongoDB.                |
| Server -> Client | `chat:new_message`  | `{ conversation_id, message }` | Message mới cho sender và receiver nếu online. |
| Client -> Server | `chat:typing`       | `{ conversation_id }`          | Báo đang nhập.                                 |
| Server -> Client | `chat:user_typing`  | `{ conversation_id, user_id }` | Receiver nhận trạng thái typing.               |
| Server -> Client | `chat:error`        | `{ message }`                  | Lỗi payload, token hoặc gửi message.           |

Trước khi chat, tạo hoặc lấy conversation bằng `POST /conversations`.

## Cấu Trúc Thư Mục

```text
src/
  @types/          Type augmentation cho Express
  config/          Env, Passport Google OAuth, Swagger, Supabase client
  constants/       Messages, enum, HTTP status, directory constants
  controllers/     Express controllers
  errors/          Custom validation error
  middlewares/     Auth, validation, rate limit, error handler
  models/          Request types, schemas, error models
  routes/          Express routers
  services/        Business logic và database/storage operations
  socket/          Socket.IO initialization và chat handlers
  utils/           JWT, crypto, email, file upload, video, helpers
uploads/           File tạm/local generated, đã gitignore
dist/              Output sau khi build, đã gitignore
```

## Scripts

| Script                 | Lệnh                                   | Mô tả                                                                              |
| ---------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`          | `tsx watch src/index.ts --development` | Chạy development với watch mode.                                                   |
| `npm run build`        | `tsc`                                  | Compile TypeScript ra `dist`.                                                      |
| `npm run start`        | `node dist/index.ts --production`      | Script production hiện tại trong `package.json`. Xem lưu ý ở phần chạy production. |
| `npm run lint`         | `eslint .`                             | Kiểm tra lint.                                                                     |
| `npm run format`       | `prettier . --write`                   | Format toàn bộ project.                                                            |
| `npm run check-format` | `prettier . --check`                   | Kiểm tra format.                                                                   |

## Ghi Chú Vận Hành

- Server tạo MongoDB indexes tự động khi khởi động thành công.
- CORS chỉ cho phép origin từ `CLIENT_URL` và bật credentials.
- Body JSON được giới hạn `10KB`.
- `uploads/`, `dist/`, `.env`, `node_modules/` không được commit.
- Nếu dùng Supabase Storage public URL, đảm bảo bucket `images` và `videos` có policy phù hợp.
- Nếu HLS không hoạt động, kiểm tra `ffmpeg` và `ffprobe` có sẵn trong `PATH` bằng `ffmpeg -version` và `ffprobe -version`.
- Nếu endpoint protected trả `Forbidden`, kiểm tra user đã xác minh email hay chưa.
- Nếu OAuth Google lỗi redirect, kiểm tra `GOOGLE_CALLBACK_URL` trùng với URL đã cấu hình trong Google Cloud Console.
