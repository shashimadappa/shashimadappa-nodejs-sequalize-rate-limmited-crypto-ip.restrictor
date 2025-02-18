const db = require("../models");
const User = db.users;
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
    try {
        // Validate request
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: "Name and Email are required!" });
        }

        // Create a new User
        const newUser = await User.create({ name, email });

        // Respond with the created user
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({
            message: "An error occurred while creating the user.",
            error: error.message
        });
    }
};

exports.getOne = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error retrieving user:", error);
        res.status(500).json({
            message: "An error occurred while retrieving the user.",
            error: error.message
        });
    }
};

exports.getAll = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error retrieving users:", error);
        res.status(500).json({
            message: "An error occurred while retrieving users.",
            error: error.message
        });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        await user.update({ name, email });

        res.status(200).json({ message: "User updated successfully!", user });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            message: "An error occurred while updating the user.",
            error: error.message
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        await user.destroy();

        res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            message: "An error occurred while deleting the user.",
            error: error.message
        });
    }
};