const transformEvent = event => {
  return {
    ...event._doc,
    _id: event._doc._id.toString(),
    date: dateToString(event._doc.date),
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

exports.user = user;
exports.events = events;
exports.singleEvent = singleEvent;
exports.transformEvent = transformEvent;