const Event = require('../../models/event');
const Booking = require('../../models/booking');

const { user, singleEvent, transformEvent } = require('../resolver/customPopulator');
const { dateToString } = require('../helpers/date');

module.exports = {
  bookings: () => {
    return Booking.find()
      .then((bookings) =>
        bookings.map((booking) => ({
          ...booking._doc,
          _id: booking.id,
          user: user.bind(this, booking._doc.user),
          event: singleEvent.bind(this, booking._doc.event),
          createdAt: dateToString(booking._doc.createdAt),
          updatedAt: dateToString(booking._doc.updatedAt)
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
          createdAt: dateToString(booking._doc.createdAt),
          updatedAt: dateToString(booking._doc.updatedAt)
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
