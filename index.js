const express = require("express")
const app = express()
const bodyParser = require('body-parser');
const rooms  = require("./data/rooms");
const bookings = require("./data/bookings");

app.use(bodyParser.json())

const PORT = 8090;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// 1. Create a Room
app.post('/createRoom', (req, res) => {
    const { roomName, seatsAvailable, amenities, price_per_hr } = req.body;
    const room = {
        roomId: rooms.length + 1,
        bookedStatus: false,
        roomName,
        seatsAvailable,
        amenities,
        price_per_hr
    }

    rooms.push(room)
    res.json({
        message: 'Room created sucessfully',
        room
    });
})


// 2. Book a Room
app.post("/bookRoom", (req, res) => {
    const { customerName, date, startTime, endTime, roomId, roomName } = req.body;
    const room = rooms.find((r) => r.roomId === parseInt(roomId));
    console.log(room)
    if (!room || room.seatsAvailable === 0) {
        return res.status(400).json({ message: 'Invalid Room ID or Room is fully booked.' });
    }

    // check if already booking or not
    const existingBooking = bookings.find((booking) => {
        return (
            booking.roomId === room.roomId &&
            booking.date === date &&
            ((startTime >= booking.startTime && startTime < booking.endTime) ||
                (endTime > booking.startTime && endTime <= booking.endTime) ||
                (startTime <= booking.startTime && endTime >= booking.endTime))
        );
    });

    if (existingBooking) {
        return res.status(400).json({ message: 'Room is already booked for the specified date and time.' });
    }
    const newBooking =
    {
        bookingId: bookings.length + 1,
        customerName,
        bookedStatus: true,
        date,
        startTime,
        endTime,
        roomId,
        roomName,

    };
    bookings.push(newBooking);
    room.seatsAvailable--;
    res.send({ message: 'Room booked successfully', newBooking })

})


// 3. List all Rooms with Booked Data
app.get("/rooms/booked", (req, res) => {
    const bookedRooms = bookings.map((booking) => {
        return {
            roomName: booking.roomName,
            customerName: booking.customerName,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            bookedStatus: booking.bookedStatus,
        }
    });
    res.send(bookedRooms);
})


// 4. List all Customers with Booked Data
app.get("/customers/booked", (req, res) => {
    const bookedCustomer = bookings.map((booking) => {
        return {
            customerName: booking.customerName,
            roomName: booking.roomName,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
        }
    })
    res.json(bookedCustomer)
})


// 5. List how many times a customer has booked the room
app.get('/customer-detail/:customerName', (req, res) => {
    const customerName = req.params.customerName;
    const customer = bookings.filter((book) => book.customerName === customerName);
    const customerDetail= customer.map((booking) => {
            return {
                customerName:booking.customerName,
                roomName: booking.roomName,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                bookingId: booking.bookingId,
                bookingStatus: true,
            };
        });

    res.json({ customerName,customerDetail});
});




