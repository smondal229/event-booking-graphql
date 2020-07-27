const Event = require('../../models/event');
const { user, transformEvent } = require('../resolver/customPopulator');
const { dateToString } = require('../helpers/date');

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
  }
};
