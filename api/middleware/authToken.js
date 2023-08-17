import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const secret = process.env.JWT_SECRET;

export const generateToken = (id) => {
  return jwt.sign({ id }, new Buffer.from(secret, "base64"), {
    expiresIn: "1h",
  });
};

export const authenticateToken = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, new Buffer.from(secret, "base64"));
    req.user = decoded.id;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ message: error.message });
  }
};
