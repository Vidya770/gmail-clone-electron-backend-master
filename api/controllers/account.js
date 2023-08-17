import Account from "./../models/Account.js";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { generateToken } from "./../middleware/authToken.js";

export async function register(req, res, next) {
  try {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
      return res.status(400).json({
        message: "Invalid data, see res.data.errors for more information",
        errors: validationErrors.errors,
      });

    const foundAccount = await Account.findOne({ email: req.body.email });
    if (foundAccount)
      return res.status(400).json({
        message: "That email is already taken",
        email: foundAccount.email,
      });

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(req.body.password, salt);

    const newAccount = new Account({
      email: req.body.email,
      password: encryptedPassword,
      name: {
        first: req.body.firstName,
        middle: req.body.middleName,
        last: req.body.lastName,
      },
    });

    const savedAccount = await newAccount.save();
    console.log("Account created", savedAccount);

    res.status(201).json({
      message: "Account created",
      email: savedAccount.email,
    });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
}

export async function login(req, res, next) {
  try {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty())
      return res.status(400).json({
        message: "Invalid data",
        errors: validationErrors.errors,
      });

    const foundAccount = await Account.findOne({ email: req.body.email });
    if (!foundAccount)
      return res.status(401).json({ message: "Invalid Email/Password" });

    const isPasswordOk = await bcrypt.compare(
      req.body.password,
      foundAccount.password
    );
    if (!isPasswordOk)
      return res.status(401).json({ message: "Invalid Email/Password" });

    const token = generateToken(foundAccount._id);
    console.log("Token generated", token);

    res.status(200).json({ message: "Login success", token });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
}

export async function getUser(req, res, next) {
  try {
    const foundAccount = await Account.findOne({ _id: req.user }).select(
      "-password -mailbox"
    );
    console.log("Account found", foundAccount);

    res.status(200).json({ message: "Account found", user: foundAccount });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
}

export async function updateProfilePicture(req, res, next) {
  try {
    const foundAccount = await Account.findOne({ _id: req.user });

    foundAccount.profilePicture = req.body.image.base64;

    const savedAccount = await foundAccount.save();
    console.log("Image uploaded", savedAccount.profilePicture);

    res.status(201).json({
      message: "Image uploaded",
      profilePicture: savedAccount.profilePicture,
    });
  } catch (error) {
    console.log(error);
    res.status(500);
  }
}
