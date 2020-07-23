const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const transformEvent = event => {
  return {
    ...event._doc,
    _id: event._doc._id.toString(),
    date: new Date(event._doc.date).toISOString(),
    creator: user.bind(this, event._doc.creator)
  };
}

const events = (eventIds) => {
  return Event.find({ _id: { $in: eventIds } }).then((events) =>
    events.map((event) => transformEvent(event))
  );
};

const user = (userId) => {
  return User.findById(userId)
    .then((user) => ({ ...user._doc, _id: user.id, createdEvents: events.bind(this, user._doc.createdEvents) }))
    .catch((err) => {});
};

const singleEvent = (eventId) => {
  return Event.findOne({ _id: eventId }).then((event) => transformEvent(event));
};

module.exports = {
  events: () => {
    return Event.find()
      .then((events) => {
        return events.map((event) => {
          return {
            ...event._doc,
            _id: event.id,
            creator: user.bind(this, event._doc.creator)
          };
        });
      })
      .catch((err) => {
        throw err;
      });
  },

  createEvent: (args) => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5f17dfe3d13d145950388f65'
    });

    let createdEvent = null;

    return event
      .save()
      .then((result) => {
        createdEvent = transformEvent(result);
        return User.findById('5f17dfe3d13d145950388f65');
      })
      .then((user) => {
        if (!user) {
          throw new Error('User not found');
        }

        user.createdEvents.push(event);
        return user.save();
      })
      .then((result) => {
        return createdEvent;
      })
      .catch((err) => {
        throw err;
      });
  },

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

  bookings: () => {
    return Booking.find()
      .then((bookings) =>
        bookings.map((booking) => ({
          ...booking._doc,
          _id: booking.id,
          user: user.bind(this, booking._doc.user),
          event: singleEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString()
        }))
      )
      .catch((err) => {
        throw err;
      });
  },
  bookEvent: ({ eventId }) => {
    return Event.findOne({ _id: eventId })
      .then((selectedEvent) => {
        const booking = new Booking({
          user: '5f17dfe3d13d145950388f65',
          event: selectedEvent
        });

        return booking.save();
      })
      .then((result) => {
        return {
          ...result._doc,
          _id: result.id,
          user: user.bind(this, booking._doc.user),
          event: singleEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString()
        };
      })
      .catch((error) => {
        throw error;
      });
  },
  cancelBooking: ({ bookingId }) => {
    let event = null;

    return Booking.findById(bookingId)
      .populate('event')
      .then((booking) => {
        event = transformEvent(booking.event);
        return Booking.deleteOne({ _id: bookingId });
      })
      .then(() => {
        if (!event) {
          throw new Error('Boooking details does not exist');
        }
        return event;
      })
      .catch((err) => {
        throw err;
      });
  }
};
