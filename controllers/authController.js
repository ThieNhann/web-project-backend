import { referrerPolicy } from "helmet";
import AuthService from "../services/authService.js";
import { verifyToken } from "../utils/jwt.js";
import { signToken } from "../utils/jwt.js";

// ĐĂNG KÝ
export const signup = async (req, res) => {
  try {
    const { username, full_name, email, password } = req.body;

    const user = await AuthService.signup(email, password, username, full_name);

    return res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    const status = err.message.includes("Email already") ? 409 : 400;
    return res.status(status).json({ message: err.message });
  }
};

// ĐĂNG NHẬP
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await AuthService.signin(email, password);

    return res.status(200).json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    console.error(err);
    const status = err.message.includes("disabled") ? 403 : 401;
    return res.status(status).json({ message: err.message });
  }
};

// GET USER INFO
export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user?.userId || req.params?.userId;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing userId" });
    }

    const userInfo = await AuthService.getUserInfo(userId);

    return res.status(200).json(userInfo);
  } catch (err) {
    console.error(err);
    return res.status(404).json({ success: false, message: err.message });
  }
};

// // VALIDATE 2FA
// const validate2FA = async (req, res) => {
//   const twoFactorToken = req.headers["authorization"]?.split(" ")[1];
//   const code = req.body.code;

//   console.log("2FA validation endpoint hit");
//   console.log("Received twoFactorToken:", twoFactorToken);
//   console.log("Received code:", code);

//   try {
//     // Find 2FA record and include user
//     const record = await db("two_factor_auth").where({ code }).first();

//     if (!record) return res.status(401).json({ message: "Invalid 2fa code" });

//     if (record.expires_at && new Date(record.expires_at) < new Date()) {
//       await db("two_factor_auth").where({ user_id: record.user_id }).delete();
//       return res.status(401).json({ message: "2FA code expired" });
//     }

//     const user = await db("users").where({ id: record.user_id }).first();
//     if (!user || !user.is_active) return res.status(403).json({ message: "Account is disabled" });

//     const userId = user.id;
//     const accessToken = signToken({ userId, username: user.username }, "1m");
//     const refreshToken = signToken({ userId, type: "refresh" }, "7d");

//     return res.status(200).json({
//       message: "2FA validation successful",
//       user: {
//         userId: user.id,
//         username: user.username,
//         fullName: user.full_name,
//         email: user.email,
//         role: user.role,
//       },
//       accessToken,
//       refreshToken,
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

//     // Delete used 2FA record
//     await db("two_factor_auth").where({ user_id: record.user_id }).delete();

//     return res.status(200).json({
//       message: "2FA validation successful",
//       user: {
//         userId: user.id,
//         username: user.username,
//         fullName: user.full_name,
//         email: user.email,
//         role: user.role,
//       },
//       accessToken,
//       refreshToken,
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// GET USER INFO
// export const getUserInfo = async (req, res) => {
//   const userId = req.user.userId || req.params?.userId || req.query?.userId || req.body?.userId;

//   console.log("[DEBUG]: userId =", userId);
//   try {
//     if (!userId) return res.status(400).json({ message: "Missing userId" });

//     const user = await db("users")
//       .where({ id: userId })
//       .select("id", "username", "full_name", "email", "is_active", "bio", "avatar_url")
//       .first();

//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (!user.is_active) return res.status(403).json({ message: "Account is disabled" });

//     const userInfo = {
//       userId: user.id,
//       username: user.username || null,
//       fullName: user.full_name || null,
//       email: user.email,
//       bio: user.bio || null,
//       avatarUrl: user.avatar_url ? process.env.SERVER_URL + user.avatar_url : null,
//     };
//     return res.status(200).json(userInfo);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// REQUEST NEW ACCESS TOKEN
export const requestNewAccessToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || req.headers["authorization"]?.split(" ")[1];
    if (!refreshToken) {
      return res.status(400).json({ message: "Missing refresh token" });
    }

    let payload;
    try {
      payload = verifyToken(refreshToken);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    if (payload.type && payload.type !== "refresh") {
      return res.status(400).json({ message: "Provided token is not a refresh token" });
    }

    const userId = payload.userId || payload.user_id;
    if (!userId) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    const isAdmin = await AuthService.getIsAdmin(userId);

    // Get new access token from service
    const userInformation = await AuthService.getUserInfo(userId);
    // console.log("User information retrieved for new access token:", userInformation);

    const newAccessToken = signToken({ userId, username: userInformation.username }, "1m");

    // console.log("Generated new access token for userId:", newAccessToken);
    // console.log("Is user admin?:", isAdmin);

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken,
      isAdmin,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// VALIDATE ACCESS TOKEN
export const validateAccessToken = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "Missing access token" });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired access token" });
    }

    if (payload.type && payload.type === "refresh") {
      return res.status(400).json({ message: "Provided token is not an access token" });
    }

    const userId = payload.userId || payload.user_id;

    return res.status(200).json({
      message: "Access token is valid",
      user: {
        userId,
        username: payload.username || null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET ME
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await AuthService.getUserInfo(userId);
    if (!user) return res.status(404).json({ message: "Non-existent user." });

    const { password, ...userInfo } = user;
    res.json({ success: true, user: userInfo });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  const { full_name, bio, avatar_url } = req.body;
  const userId = req.user.id;
  try {
    const profileData = {
      fullName: full_name,
      bio: bio,
      avatarUrl: avatar_url,
    };

    const [updatedUser] = await AuthService.updateProfile(userId, profileData);

    res.json({ success: true, message: "Updated successfully.", user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
