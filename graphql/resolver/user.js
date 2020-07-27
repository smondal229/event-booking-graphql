const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');

module.exports = {
  createUser: (args) => {
    return User.findOne({ email: args.userInput.email })
      .then((user) => {
        if (user) {
          throw new Error('User already exists');
        }

        return bcrypt.hash(args.userInput.password, 12);
      })
      .then((hashedPassword) => {
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });

        return user.save();
      })
      .then((res) => ({
        ...res._doc,
        password: null,
        _id: res.id
      }))
      .catch((err) => {
        throw err;
      });
  },
  login: ({ email, password }) => {
    return User.findOne({ email }).then((user) => {
      if (!user) {
        throw new Error('User does not exist!');
      }
      console.log('user', user.email, user.id);
      return bcrypt.compare(password, user.password).then((isEqual) => {
        if (!isEqual) {
          console.log('password not match', isEqual);
          throw new Error('Password is incorrect');
        }

        return jwt
          .sign({ userId: user.id, email: user.email }, 'eventbookingappkey', {
            expiresIn: '1h'
          })
          .then((token) => ({
            userId: user.id,
            token: token,
            tokenExpiration: 1
          }));
      });
    });
  }
};
