const bcrypt = require('bcrypt');

module.exports = {
    hashPassword: async (password: string) => {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    },

    comparePassword: async (password: string, hashedPassword: string) => {
        return await bcrypt.compare(password, hashedPassword);
    }
};