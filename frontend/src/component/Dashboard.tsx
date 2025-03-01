import { useEffect, useState } from "react";
import Navbar from "./navbar";

const Dashboard = () => {
  // User Info
  const [user, setUser] = useState<any>({});
  // Booking Info
  const [bookingInfo, setBookingInfo] = useState<any>({});
  // Popup modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Temp
  const bookings = [
    {
      id: 1,
      room: "DR001",
      room_seating_capacity: 8,
      room_type: "Discussion Room",
      building_name: "NUS-ISS",
      date: "2025-01-31",
      start_time: "2025-02-27 16:00:00+00",
      end_time: "2025-02-27 17:00:00+00",
    },
    {
      id: 1,
      room: "LT001",
      room_seating_capacity: 8,
      room_type: "Discussion Room",
      building_name: "NUS-ISS",
      date: "2025-01-31",
      start_time: "2025-02-27 16:00:00+00",
      end_time: "2025-02-27 17:00:00+00",
    },
    {
      id: 1,
      room: "DR002",
      room_seating_capacity: 8,
      room_type: "Discussion Room",
      building_name: "NUS-ISS",
      date: "2025-01-31",
      start_time: "2025-02-27 16:00:00+00",
      end_time: "2025-02-27 17:00:00+00",
    },
  ];

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");

    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUser(user);
    } else {
      window.location.href = "/login";
    }
  }, []);

  const GetBookingInfo = () => {
    // Send api to backend to get booking info
  };

  // Convert from UTC 0 to singapore date
  const DateConversion = (date: string) => {
    const dateObj = new Date(date);
    return dateObj
      .toLocaleDateString("en-GB", {
        timeZone: "Asia/Singapore",
      })
      .replace(/\//g, "-");
  };

  const TimeConversion = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString("en-GB", {
      timeZone: "Asia/Singapore",
    });
  };

  const handleCancelClick = (booking:any) => {
    console.log("Trying to cancel booking:", booking);
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleCancelConfirm = () => {
    console.log("Canceled booking:", selectedBooking);
    setIsModalOpen(false);
  };

  const handleCancelClose = () => {
    console.log("Cancel selection");
    setSelectedBooking(null);
    setIsModalOpen(false);
  };

  return (
    <>
    <div className="flex flex-col w-full min-h-screen">
      {/* Navbar Section */}
      <div className="flex justify-end">
        <Navbar />
      </div>
      {/* Main Content Section */}
      <div className="flex justify-center items-center">
        <div className="w-[90%] p-6 bg-white rounded-lg shadow-md">
          {/* Page Header */}
          <h1 className="text-3xl font-semibold text-gray-800">
            Welcome {user.role_id === 1 ? "Admin" : "User "}
          </h1>{" "}
          <br />
          <h3 className="text-3xl font-semibold text-gray-800">
            Room Bookings
          </h3>
          {/* Bookings List */}
          <div className="mt-6">
            <p className="text-lg text-gray-600">
              Here is a list of your upcoming room bookings:
            </p>
            <div className="mt-4">
              {/* Placeholder content (To be replaced with a table/card) */}
              <div className="p-4 bg-gray-100 rounded-lg">
                {bookings !== null && bookings.length === 0 ? (
                  <p className="text-gray-500">
                    No bookings yet. Start by making a booking!
                  </p>
                ) : (
                  <ul className="flex flex-wrap justify-start gap-4">
                    {bookings.map((booking) => (
                      <li
                        key={booking.id}
                        className="relative w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
                      >
                        <div className="relative flex flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md">
                          <div className="relative mx-4 mt-3 h-56 overflow-hidden rounded-xl bg-blue-gray-500 text-white shadow-lg shadow-blue-gray-500/40">
                            <img
                              className="w-full h-full object-cover"
                              src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
                              alt="img-blur-shadow"
                            />
                          </div>
                          <div className="p-6">
                            <h4 className="mb-2 block font-sans text-xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
                              {booking.room} - {booking.building_name}
                            </h4>
                            <p className="mb-2 block font-sans text-sm font-bold leading-relaxed text-black antialiased">
                              Seating Capacity:
                              <span className="block font-sans text-base font-semibold leading-relaxed text-inherit antialiased">
                                {booking.room_seating_capacity}
                              </span>
                            </p>
                            <p className="mb-2 block font-sans text-sm font-bold leading-relaxed text-black antialiased">
                              Booking Date:
                              <span className="block font-sans text-base font-semibold leading-relaxed text-inherit antialiased">
                                {DateConversion(booking.start_time)}
                              </span>
                            </p>
                            <p className="mb-2 block font-sans text-sm font-bold leading-relaxed text-black antialiased">
                              Booking Session:
                              <span className="block font-sans text-base font-semibold leading-relaxed text-inherit antialiased">
                                {TimeConversion(booking.start_time)} -{" "}
                                {TimeConversion(booking.end_time)}
                              </span>
                            </p>
                          </div>
                          <div className="p-6 pt-0">
                            <button
                              className="select-none rounded-lg bg-red-500 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-red-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                              type="button"
                              data-ripple-light="true"
                              onClick={() => handleCancelClick(booking)}
                            >
                              Cancel Booking
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Modal for confirmation */}
    {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg w-1/3">
            <h3 className="text-xl text-black font-semibold mb-4">Are you sure you want to cancel this booking?</h3>
            <div className="flex justify-between">
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-md"
                onClick={handleCancelClose}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white py-2 px-4 rounded-md"
                onClick={handleCancelConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
