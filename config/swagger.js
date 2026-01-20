import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web Project Backend API",
      version: "1.0.0",
      description: "API documentation for the web project backend with user authentication, games, friends, messages, and reviews",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Development server",
      },
      {
        url: "https://api.example.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from login endpoint",
        },
        apiKey: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
          description: "API Key for server-to-server communication",
        },
      },
      schemas: {
        UserInfo: {
          type: "object",
          properties: {
            userId: { type: "string" },
            username: { type: "string", nullable: true },
            fullName: { type: "string", nullable: true },
            email: { type: "string" },
            bio: { type: "string", nullable: true },
            avatarUrl: { type: "string", nullable: true },
          },
        },
        SignupResponse: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                userId: { type: "string" },
                email: { type: "string" },
                username: { type: "string", nullable: true },
                full_name: { type: "string", nullable: true },
              },
            },
          },
        },
        SigninResponse: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        TokenValidationResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            user: {
              type: "object",
              properties: {
                userId: { type: "string" },
                username: { type: "string", nullable: true },
              },
            },
          },
        },
        Game: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            code: { type: "string" },
            description: { type: "string" },
            is_active: { type: "boolean" },
            board_width: { type: "integer" },
            board_height: { type: "integer" },
            timer: { type: "integer" },
          },
        },
        GameListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            count: { type: "integer" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Game" },
            },
          },
        },
        BoardSizeResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                board_width: { type: "integer" },
                board_height: { type: "integer" },
              },
            },
          },
        },
        Rankings: {
          type: "object",
          properties: {
            rankings: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  username: { type: "string" },
                  avatar_url: { type: "string" },
                  total_score: { type: "integer" },
                },
              },
            },
          },
        },
        Achievements: {
          type: "object",
          properties: {
            achievements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  iconUrl: { type: "string" },
                  description: { type: "string" },
                  dateAchieved: { type: "string", format: "date-time" },
                },
              },
            },
            hasMore: { type: "boolean" },
          },
        },
        FriendStatus: {
          type: "object",
          properties: {
            friendStatus: {
              type: "string",
              enum: ["not_friends", "pending", "accepted"],
            },
          },
        },
        FriendRequestsResponse: {
          type: "object",
          properties: {
            friendRequests: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  requestUserId: { type: "string" },
                  requestUsername: { type: "string" },
                  requestUserAvatarUrl: { type: "string" },
                  status: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
        Review: {
          type: "object",
          properties: {
            id: { type: "integer" },
            user_id: { type: "string" },
            game_id: { type: "integer" },
            rating: { type: "number" },
            comment: { type: "string" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        ReviewResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            review_id: { type: "integer" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        ErrorResponseWithSuccess: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./routes/authRoutes.js",
    "./routes/adminRoutes.js",
    "./routes/usersRoutes.js",
    "./routes/profileRoutes.js",
    "./routes/friendRoutes.js",
    "./routes/gameRoutes.js",
    "./routes/searchRoutes.js",
    "./routes/messageRoutes.js",
    "./routes/reviewRoutes.js",
  ],
};

export const specs = swaggerJsdoc(options);
