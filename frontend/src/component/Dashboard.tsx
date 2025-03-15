import { useEffect, useState } from "react";
import Navbar from "./navbar";
import axios from "axios";
import EditBookingModal from "./EditBookingModal";

interface Booking {
  booking_id: number;
  room_id: number;
  user_id: number;
  booking_date?: string;
  start_time: string;
  end_time: string;
  booking_purpose: string;
  status: string;
  is_active: boolean;
  created_on: string;
  updated_on: string;
  room_name?: string;
  room_seating_capacity?: number;
  room_type?: string;
  building_name?: string;
}

const Dashboard = () => {
  // User Info
  const [user, setUser] = useState<any>({});
  // Booking Info
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Popup modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  // Filter
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  // Edit booking
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");

    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchUserBookings(userData.user_id);
    } else {
      window.location.href = "/login";
    }
  }, []);

  // Fetch bookings for the current user
  const fetchUserBookings = async (userId: number) => {
    setLoading(true);
    try {
      // Get all bookings
      const response = await axios.get('http://localhost:3000/booking');
      
      if (response.data && Array.isArray(response.data)) {
        // Filter bookings by user_id and active status
        const userBookings = response.data.filter(booking => 
          booking.user_id === userId && 
          booking.status !== 'cancelled'
        );
        
        // Get room details for each booking
        const bookingsWithRoomDetails = await Promise.all(
          userBookings.map(async (booking) => {
            try {
              const roomResponse = await axios.get(`http://localhost:3000/rooms/${booking.room_id}`);
              return {
                ...booking,
                room_name: roomResponse.data.room_name,
                room_seating_capacity: roomResponse.data.room_seating_capacity,
                room_type: roomResponse.data.room_type,
                building_name: roomResponse.data.building_name
              };
            } catch (error) {
              console.error(`Error fetching room details for booking ${booking.booking_id}:`, error);
              return booking;
            }
          })
        );
        
        // Sort bookings by start_time (upcoming first)
        const sortedBookings = bookingsWithRoomDetails.sort((a, b) => 
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        
        setBookings(sortedBookings);
        console.log(`Found ${sortedBookings.length} bookings for user ${userId}`);
      } else {
        console.error("Invalid response format:", response.data);
        setError("Received invalid data format from server");
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching user bookings:", err);
      setError("Failed to load your bookings. Please try again later.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
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
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const format12HourTime = (dateString: string) => {
    // First parse the UTC time
    const date = new Date(dateString);
    
    // Manually adjust for Singapore timezone (UTC+8)
    // Instead of using the browser's timezone conversion which might be causing issues
    const singaporeTime = new Date(date.getTime());
    
    // Format the time in 12-hour format
    const hours = singaporeTime.getUTCHours();
    const minutes = singaporeTime.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };
  
  // Use this version of formatBookingTime in Dashboard.tsx
  const formatBookingTime = (startTime: string, endTime: string) => {
    const start = format12HourTime(startTime);
    const end = format12HourTime(endTime);
  
    // Check if booking is upcoming, ongoing, or past
    const now = new Date();
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    let status = "";
    if (now < startDate) {
      status = "upcoming";
    } else if (now >= startDate && now <= endDate) {
      status = "ongoing";
    } else {
      status = "past";
    }
    
    return { formattedTime: `${start} - ${end}`, status };
  };
  const handleCancelClick = (booking: Booking) => {
    console.log("Trying to cancel booking:", booking);
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };
  const handleEditBooking = (booking: Booking) => {
    console.log("Opening edit modal for booking:", booking);
    setBookingToEdit(booking);
    setIsEditModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedBooking) return;
    
    try {
      // Call API to delete booking instead of just canceling it
      // Use the DELETE HTTP method to completely remove the booking
      await axios.delete(`http://localhost:3000/booking/${selectedBooking.booking_id}`);
      
      // Refresh bookings list
      fetchUserBookings(user.user_id);
      
      console.log("Deleted booking:", selectedBooking);
      
      // Optional: Show success message
      setError(null); // Clear any previous errors
      
      // You could add a success message state if you want to show a toast or notification
      // setSuccessMessage("Booking successfully deleted");
      
    } catch (error) {
      console.error("Error deleting booking:", error);
      setError("Failed to delete booking. Please try again.");
    } finally {
      setIsModalOpen(false);
      setSelectedBooking(null);
    }
  };

  const handleCancelClose = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
  };
  const handleEditClose = () => {
    setBookingToEdit(null);
    setIsEditModalOpen(false);
  };

  // Handle successful booking edit
  const handleEditSuccess = () => {
    fetchUserBookings(user.user_id);
  };


  const getStatusClass = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "past":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const now = new Date();
    const endDate = new Date(booking.end_time);
    
    if (activeTab === 'upcoming') {
      // Show active bookings that haven't ended yet
      return booking.is_active && endDate >= now;
    } else {
      // Show past bookings (ended or inactive)
      return !booking.is_active || endDate < now;
    }
  });

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
              Welcome {user.role_id === 1 ? "Admin" : "User"}
            </h1>
            <br />
            <h3 className="text-3xl font-semibold text-gray-800">
              My Room Bookings
            </h3>
            {/* Bookings List */}
            <div className="mt-6">
              <div className="flex justify-between items-center">
                <div>
                  {/* Tabs */}
                  <div className="flex space-x-4 mt-2">
                    <button
                      className={`px-4 py-2 font-medium rounded-t-lg transition ${
                        activeTab === 'upcoming'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setActiveTab('upcoming')}
                    >
                      Active & Upcoming
                    </button>
                    <button
                      className={`px-4 py-2 font-medium rounded-t-lg transition ${
                        activeTab === 'past'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setActiveTab('past')}
                    >
                      Past Bookings
                    </button>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              
              <div className="mt-4">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="ml-4 text-gray-600">Loading your bookings...</p>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="p-8 bg-gray-50 rounded-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-4 text-gray-500 text-lg">
                      {activeTab === 'upcoming' 
                        ? "No active or upcoming bookings found." 
                        : "No past bookings found."}
                    </p>
                    {activeTab === 'upcoming' && (
                      <button
                        onClick={() => window.location.href = "/rooms"}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-150"
                      >
                        Browse Available Rooms
                      </button>
                    )}
                  </div>
                ) : (
                  <ul className="flex flex-wrap justify-start gap-4">
                    {filteredBookings.map((booking) => {
                      const { formattedTime, status } = formatBookingTime(booking.start_time, booking.end_time);
                      return (
                        <li
                          key={booking.booking_id}
                          className="relative w-full sm:w-1/2 md:w-1/3 lg:w-1/4 mb-4"
                        >
                          <div className="relative flex flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md h-full">
                            <div className="relative mx-4 mt-3 h-48 overflow-hidden rounded-xl bg-blue-gray-500 text-white shadow-lg shadow-blue-gray-500/40">
                              <img
                                className="w-full h-full object-cover"
                                src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80"
                                alt="img-blur-shadow"
                              />
                              <div className="absolute top-2 right-2">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusClass(status)}`}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                              </div>
                              {!booking.is_active && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">Inactive</span>
                                </div>
                              )}
                            </div>
                            <div className="p-6 flex-1">
                              <h4 className="mb-2 block font-sans text-xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
                                {booking.room_name} - {booking.building_name}
                              </h4>
                              <p className="mb-2 block font-sans text-sm font-bold leading-relaxed text-black antialiased">
                                Room Type:
                                <span className="block font-sans text-base font-normal leading-relaxed text-gray-700 antialiased">
                                  {booking.room_type}
                                </span>
                              </p>
                              <p className="mb-2 block font-sans text-sm font-bold leading-relaxed text-black antialiased">
                                Seating Capacity:
                                <span className="block font-sans text-base font-normal leading-relaxed text-gray-700 antialiased">
                                  {booking.room_seating_capacity} people
                                </span>
                              </p>
                              <p className="mb-2 block font-sans text-sm font-bold leading-relaxed text-black antialiased">
                                Booking Date:
                                <span className="block font-sans text-base font-normal leading-relaxed text-gray-700 antialiased">
                                  {DateConversion(booking.start_time)}
                                </span>
                              </p>
                              <p className="mb-2 block font-sans text-sm font-bold leading-relaxed text-black antialiased">
                                Booking Time:
                                <span className="block font-sans text-base font-normal leading-relaxed text-gray-700 antialiased">
                                  {formattedTime}
                                </span>
                              </p>
                              <p className="mb-2 block font-sans text-sm font-bold leading-relaxed text-black antialiased">
                                Purpose:
                                <span className="block font-sans text-base font-normal leading-relaxed text-gray-700 antialiased">
                                  {booking.booking_purpose}
                                </span>
                              </p>
                            </div>
                            <div className="p-6 pt-0">
                              {booking.is_active && status !== "past" && (
                                <div className="mt-auto pt-4 flex space-x-2">
                                <button
                                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition duration-150"
                                  type="button"
                                  onClick={() => handleCancelClick(booking)}
                                >
                                  Cancel Booking
                                </button>
                                <button
                                  onClick={() => handleEditBooking(booking)}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-150"
                                >
                                  Edit Booking
                                </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for confirmation */}
      // Update the cancel modal time display section in Dashboard.tsx

    {/* Modal for cancel confirmation - Updated to match the design in Image 2 */}
{/* Modal for cancel confirmation - Using Tailwind UI modal structure */}
{isModalOpen && (
  <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    {/* Background backdrop */}
    <div className="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true"></div>
    
    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Modal panel */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-10">
                <svg className="size-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                  Are you sure you want to cancel this booking?
                </h3>
                
                <div className="mt-4">
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>
                      <span className="inline-block w-14">Room:</span> 
                      <span className="font-medium">{selectedBooking?.room_name}</span>
                    </p>
                    <p>
                      <span className="inline-block w-14">Date:</span> 
                      <span className="font-medium">{DateConversion(selectedBooking?.start_time || "")}</span>
                    </p>
                    <p>
                      <span className="inline-block w-14">Time:</span> 
                      <span className="font-medium">{format12HourTime(selectedBooking?.start_time || "")} - {format12HourTime(selectedBooking?.end_time || "")}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button 
              type="button" 
              className="inline-flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-700 sm:ml-3 sm:w-auto"
              onClick={handleCancelConfirm}
            >
              Yes, Cancel
            </button>
            <button 
              type="button" 
              className="inline-flex w-full justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-700 sm:ml-3 sm:w-auto"
              onClick={handleCancelClose}
            >
              No, Keep It
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
   {/* Modal for editing booking */}
   {isEditModalOpen && bookingToEdit && (
        <EditBookingModal
          isOpen={isEditModalOpen}
          onClose={handleEditClose}
          booking={bookingToEdit}
          onEditSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default Dashboard;