const userModel = require(`../user`);
const bcrypt = require(`bcryptjs`);

async function createUser(username, password){ 

const hashedPsw = await bcrypt.hash(password, 12);
user = new userModel({
    username,
    password: hashedPsw
});
await user.save();
}

module.exports = createUser;