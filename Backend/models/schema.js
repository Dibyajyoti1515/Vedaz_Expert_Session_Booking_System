const mongoose = require("mongoose");

const defaultOptions = {
    timestamps: true,
    versionKey: false,
};

const createSchema = (definition, options = {}) => {
    return new mongoose.Schema(definition, {
        ...defaultOptions,
        ...options,
    });
};

module.exports = { createSchema, mongoose };