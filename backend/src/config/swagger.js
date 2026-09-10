const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "JorJek API",
      version: "1.0.0",
      description:
        "REST API for the JorJek knowledge-sharing platform. All endpoints return JSON. " +
        "Authenticated endpoints require a JWT Bearer token in the `Authorization` header: `Authorization: Bearer <token>`.",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste your JWT access token obtained from /auth/login or /auth/signup.",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Something went wrong" },
          },
        },
        UserSafe: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", example: "9f2c7a1d-4b6e-4f88-9f19-4f3723b3e1a0" },
            email: { type: "string", format: "email", example: "student@student.cadt.edu.kh" },
            displayName: { type: "string", example: "Dara Chan" },
            role: { type: "string", enum: ["STUDENT", "MENTOR", "ADMIN"], example: "STUDENT" },
            bio: { type: "string", nullable: true, example: "I like to code" },
            karma: { type: "integer", example: 42 },
            emailVerified: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time", example: "2025-01-15T10:30:00Z" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            user: { $ref: "#/components/schemas/UserSafe" },
          },
        },
        Tag: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", example: "a5b44c7e-8d2f-4b8a-9c1e-5f6a2b3c4d5e" },
            name: { type: "string", example: "JavaScript" },
            slug: { type: "string", example: "javascript" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Post: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            type: { type: "string", enum: ["question", "article", "discussion"], example: "question" },
            title: { type: "string", example: "How do I paginate in PostgreSQL?" },
            body: { type: "string", example: "I'm trying to..." },
            author: { $ref: "#/components/schemas/UserSafe" },
            tags: {
              type: "array",
              items: { type: "object", properties: { tag: { $ref: "#/components/schemas/Tag" } } },
            },
            votes: { type: "array", items: { type: "object", properties: { value: { type: "integer" } } } },
            created_at: { type: "string", format: "date-time" },
          },
        },
        PostList: {
          type: "object",
          properties: {
            posts: { type: "array", items: { $ref: "#/components/schemas/Post" } },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            total: { type: "integer", example: 100 },
          },
        },
        Comment: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            post_id: { type: "string", format: "uuid" },
            parent_comment_id: { type: "string", format: "uuid", nullable: true },
            body: { type: "string", example: "Great explanation!" },
            author: { $ref: "#/components/schemas/UserSafe" },
            votes: { type: "array", items: { type: "object", properties: { value: { type: "integer" } } } },
            created_at: { type: "string", format: "date-time" },
          },
        },
        CommentList: {
          type: "object",
          properties: {
            comments: { type: "array", items: { $ref: "#/components/schemas/Comment" } },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            total: { type: "integer", example: 50 },
          },
        },
        Vote: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            user_id: { type: "string", format: "uuid" },
            post_id: { type: "string", format: "uuid", nullable: true },
            comment_id: { type: "string", format: "uuid", nullable: true },
            value: { type: "integer", enum: [-1, 1], example: 1 },
            created_at: { type: "string", format: "date-time" },
          },
        },
        VoteScore: {
          type: "object",
          properties: {
            votes: { type: "array", items: { $ref: "#/components/schemas/Vote" } },
            score: { type: "integer", example: 12 },
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            user_id: { type: "string", format: "uuid" },
            type: { type: "string", enum: ["reply", "upvote"], example: "reply" },
            title: { type: "string" },
            message: { type: "string" },
            data: { type: "object", additionalProperties: true },
            read: { type: "boolean", example: false },
            created_at: { type: "string", format: "date-time" },
          },
        },
        NotificationList: {
          type: "object",
          properties: {
            notifications: { type: "array", items: { $ref: "#/components/schemas/Notification" } },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 50 },
            total: { type: "integer", example: 30 },
          },
        },
        Report: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            reporter_id: { type: "string", format: "uuid" },
            post_id: { type: "string", format: "uuid", nullable: true },
            comment_id: { type: "string", format: "uuid", nullable: true },
            target_user_id: { type: "string", format: "uuid", nullable: true },
            reason: { type: "string", example: "Spam" },
            status: { type: "string", enum: ["pending", "approved", "rejected"], example: "pending" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        ReportList: {
          type: "object",
          properties: {
            reports: { type: "array", items: { $ref: "#/components/schemas/Report" } },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 20 },
            total: { type: "integer", example: 10 },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.routes.js", "./src/app.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec };