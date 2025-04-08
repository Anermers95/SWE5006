import { useEffect, useState } from "react";
import Navbar from "./navbar";
import axios from "axios";
import BookingModal from "./BookingModal";

interface Room {
  room_id: number;
  room_name: string;
  room_type: string;
  building_name: string;
  room_seating_capacity: number;
  is_active: boolean;
  description?: string;
  image_url?: string;
}

interface Booking {
  booking_id: number;
  room_id: number;
  user_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

interface NotificationProps {
  message: string;
  success: boolean;
  onClose: () => void;
}

// Notification component similar to login page
const Notification = ({ message, success, onClose }: NotificationProps) => {
  if (!message) return null;
  
  return (
    <div
      className={`flex w-full max-w-sm overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800 mt-4 ${
        success ? "border border-emerald-500" : ""
      }`}
    >
      <div
        className={`flex items-center justify-center w-12 ${
          success ? "bg-emerald-500" : "bg-red-500"
        }`}
      >
        <svg
          className="w-6 h-6 text-white fill-current"
          viewBox="0 0 40 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          {success ? (
            <path d="M20 3.33331C10.8 3.33331 3.33337 10.8 3.33337 20C3.33337 29.2 10.8 36.6666 20 36.6666C29.2 36.6666 36.6667 29.2 36.6667 20C36.6667 10.8 29.2 3.33331 20 3.33331ZM16.6667 28.3333L8.33337 20L10.6834 17.65L16.6667 23.6166L29.3167 10.9666L31.6667 13.3333L16.6667 28.3333Z" />
          ) : (
            <path d="M20 3.36667C10.8167 3.36667 3.3667 10.8167 3.3667 20C3.3667 29.1833 10.8167 36.6333 20 36.6333C29.1834 36.6333 36.6334 29.1833 36.6334 20C36.6334 10.8167 29.1834 3.36667 20 3.36667ZM19.1334 33.3333V22.9H13.3334L21.6667 6.66667V17.1H27.25L19.1334 33.3333Z" />
          )}
        </svg>
      </div>
      <div className="px-4 py-2 -mx-3 flex justify-between w-full">
        <div className="mx-3">
          <span
            className={`font-semibold ${
              success
                ? "text-emerald-500 dark:text-emerald-400"
                : "text-red-500 dark:text-red-400"
            }`}
          >
            {success ? "Success" : "Error"}
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-200">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white font-bold"
        >
          ✖
        </button>
      </div>
    </div>
  );
};

const RoomListings = () => {
  // State management
  const [user, setUser] = useState<any>({});
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("");
  const [filterCapacity, setFilterCapacity] = useState<number | "">("");
  const [filterBuilding, setFilterBuilding] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterStartTime, setFilterStartTime] = useState<string>("");
  const [filterEndTime, setFilterEndTime] = useState<string>("");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; success: boolean } | null>(null);
  const [isStudent, setIsStudent] = useState<boolean>(false);
  const [availableRoomTypes, setAvailableRoomTypes] = useState<string[]>([]);
  // Sample image for rooms that don't have one
  const defaultRoomImage = "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80";
  
  // Get current date in YYYY-MM-DD format for default date filter
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Set default date to today
  useEffect(() => {
    setFilterDate(getCurrentDate());
  }, []);

  // Fetch rooms and bookings from API
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
  
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUser(user);
      console.log("current user", user)
      // Check if user is a student (user_role_id = 2)
      const userIsStudent = user.role_id === 2;
      setIsStudent(userIsStudent);
      console.log("user is student", userIsStudent)
      // If user is a student, they can only see discussion rooms
      if (userIsStudent) {
        setAvailableRoomTypes(['Discussion Room']);
        setFilterType('Discussion Room'); // Auto-select discussion room filter for students
      } else {
        // For non-students, all room types are available
        setAvailableRoomTypes([]);
      }
    } else {
      // Redirect to login if needed
      window.location.href = "/login";
      return;
    }
  
    fetchRooms();
    fetchBookings();
  }, [bookingSuccess]); // Refetch rooms when a booking is successful

  // Function to fetch rooms from backend
  const fetchRooms = async () => {
    setLoading(true);
    try {
      // Call the API to get all rooms
      const response = await axios.get('http://localhost:3000/rooms');
      
      if (response.data && Array.isArray(response.data)) {
        // Filter rooms that are active (is_active is true)
        let activeRooms = response.data;
        
        // If user is a student, filter to only show discussion rooms
        if (isStudent) {
          activeRooms = activeRooms.filter(room => room.room_type.toLowerCase() === 'discussion room');
          console.log(`Student user: Filtered to ${activeRooms.length} discussion rooms`);
        }
        
        setRooms(activeRooms);
        
        // Log the number of active rooms found
        console.log(`Found ${activeRooms.length} active rooms out of ${response.data.length} total rooms`);
      } else {
        console.error("Invalid response format:", response.data);
        setError("Received invalid data format from server");
        setRooms([]);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Failed to load rooms. Please try again later.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch bookings from backend
  const fetchBookings = async () => {
    try {
      // Call the API to get all bookings
      const response = await axios.get('http://localhost:3000/booking');
      
      if (response.data && Array.isArray(response.data)) {
        setBookings(response.data);
        console.log(`Found ${response.data.length} bookings`);
      } else {
        console.error("Invalid bookings response format:", response.data);
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
    }
  };

  // Check if a room is available at the selected time slot
  const isRoomAvailable = (roomId: number) => {
    // If no date or time filters are set, room is considered available
    if (!filterDate || (!filterStartTime && !filterEndTime)) return true;

    // Find bookings for this room on the selected date
    const roomBookings = bookings.filter(booking => {
      // Check if date parts match (accounting for timezone)
      let bookingDate;
      
      if (booking.booking_date) {
        bookingDate = booking.booking_date;
      } else {
        // Handle ISO format with timezone
        const bookingDateTime = new Date(booking.start_time);
        bookingDate = bookingDateTime.toISOString().split('T')[0];
      }
      
      return booking.room_id === roomId && 
             bookingDate === filterDate &&
             booking.status !== 'cancelled';
    });

    // If no bookings exist for this room on selected date, it's available
    if (roomBookings.length === 0) return true;

    // Convert HH:MM time to minutes for comparison
    const timeToMinutes = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + (minutes || 0);
    };
    
    // Extract time from ISO format and convert to minutes
    const isoTimeToMinutes = (isoStr: string): number => {
      const date = new Date(isoStr);
      return date.getUTCHours() * 60 + date.getUTCMinutes();
    };

    // If only start time filter is set (e.g., "14:00")
    if (filterStartTime && !filterEndTime) {
      const filterMinutes = timeToMinutes(filterStartTime);
      
      // Check if the selected time conflicts with any booking
      return !roomBookings.some(booking => {
        const startMinutes = isoTimeToMinutes(booking.start_time);
        const endMinutes = isoTimeToMinutes(booking.end_time);
        
        console.log(
          `Comparing filter time ${filterStartTime} (${filterMinutes} mins) with booking`,
          `${new Date(booking.start_time).toISOString()} (${startMinutes} mins) to`,
          `${new Date(booking.end_time).toISOString()} (${endMinutes} mins)`
        );
        
        // If filter time is between booking start and end time, it's not available
        return filterMinutes >= startMinutes && filterMinutes < endMinutes;
      });
    }

    // If only end time filter is set
    if (!filterStartTime && filterEndTime) {
      const filterMinutes = timeToMinutes(filterEndTime);
      
      return !roomBookings.some(booking => {
        const startMinutes = isoTimeToMinutes(booking.start_time);
        const endMinutes = isoTimeToMinutes(booking.end_time);
        
        // If filter end time is between booking start and end, it's not available
        return filterMinutes > startMinutes && filterMinutes <= endMinutes;
      });
    }

    // If both start and end time filters are set
    if (filterStartTime && filterEndTime) {
      const filterStartMinutes = timeToMinutes(filterStartTime);
      const filterEndMinutes = timeToMinutes(filterEndTime);
      
      return !roomBookings.some(booking => {
        const bookingStartMinutes = isoTimeToMinutes(booking.start_time);
        const bookingEndMinutes = isoTimeToMinutes(booking.end_time);
        
        // Check for any overlap between requested time and booked time
        // Case 1: Filter start time falls within a booking
        const case1 = filterStartMinutes >= bookingStartMinutes && filterStartMinutes < bookingEndMinutes;
        
        // Case 2: Filter end time falls within a booking
        const case2 = filterEndMinutes > bookingStartMinutes && filterEndMinutes <= bookingEndMinutes;
        
        // Case 3: Filter time completely contains a booking
        const case3 = filterStartMinutes <= bookingStartMinutes && filterEndMinutes >= bookingEndMinutes;
        
        console.log(
          `Checking overlap for ${filterStartTime}-${filterEndTime} with`,
          `${new Date(booking.start_time).toUTCString()}-${new Date(booking.end_time).toUTCString()}:`,
          case1 ? "Filter start inside booking" : 
          case2 ? "Filter end inside booking" :
          case3 ? "Filter contains booking" : "No overlap"
        );
        
        return case1 || case2 || case3;
      });
    }
    
    return true;
  };

  const filteredRooms = rooms.filter(room => {
    if (filterType && room.room_type !== filterType) return false;
    if (filterCapacity && room.room_seating_capacity < Number(filterCapacity)) return false;
    if (filterBuilding && room.building_name !== filterBuilding) return false;
    if (!isRoomAvailable(room.room_id)) return false;
    return true; // Show both active and inactive rooms
  });

  // Get unique values for filters
  const uniqueTypes = Array.from(new Set(rooms.map(room => room.room_type)));
  const uniqueBuildings = Array.from(new Set(rooms.map(room => room.building_name)));

  // Generate time options for select dropdown (30-minute intervals)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour < 22; hour++) {
      for (let minute of ['00', '30']) {
        const time24h = `${hour.toString().padStart(2, '0')}:${minute}`;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        const displayTime = `${hour12}:${minute} ${ampm}`;
        
        options.push(
          <option key={time24h} value={time24h}>{displayTime}</option>
        );
      }
    }
    return options;
  };

  // Handle booking room
  const handleBookRoom = (roomId: number) => {
    // Open booking modal with selected room
    setSelectedRoomId(roomId);
    
    // Pre-set booking date and time in modal if filters are active
    if (filterDate && filterStartTime && filterEndTime) {
      setIsBookingModalOpen(true);
      // You might need to modify your BookingModal to accept preselected values
    } else {
      setIsBookingModalOpen(true);
    }
  };

  // Handle booking success
  const handleBookingSuccess = () => {
    setBookingSuccess(prev => !prev); // Toggle to trigger a refetch
    setNotification({
      message: "Room booked successfully! Your booking has been confirmed.",
      success: true
    });
    
    // Auto hide notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Handle closing the booking modal
  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedRoomId(null);
  };

  // Handle viewing room details
  const handleViewDetails = (roomId: number) => {
    console.log(`Navigate to details page for room ${roomId}`);
    window.location.href = `/rooms/${roomId}`;
  };

  // Clear time filters
  const clearTimeFilters = () => {
    setFilterDate(getCurrentDate());
    setFilterStartTime("");
    setFilterEndTime("");
  };

  return (
    // Wrapper with dark background to match dashboard
    <div className="flex flex-col w-full min-h-screen">
      {/* Top Navigation */}
      <div className="flex justify-end">
        <Navbar />
      </div>
  
      {/* Main content container with white background and rounded corners */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-800">Room Directory</h1>
            <p className="text-gray-600 mt-2">
              {isStudent 
                ? "Browse and book available discussion rooms for your study sessions" 
                : "Browse and book available rooms across campus"}
            </p>
            
            {/* Student Access Notification */}
            {isStudent && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded text-blue-700">
                <strong>Student Access:</strong> As a student, you can book discussion rooms for your study sessions.
              </div>
            )}
            
            {/* Notification */}
            {notification && (
              <Notification 
                message={notification.message} 
                success={notification.success} 
                onClose={() => setNotification(null)} 
              />
            )}
          </div>
  
          {/* Filters Section */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h2 className="font-medium text-lg mb-4 text-gray-900">Filters</h2>
            
            {/* Room Properties Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Room Type Filter - Only shown to non-students or modified for students */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Room Type</label>
                {isStudent ? (
                  <div className="w-full border border-gray-300 rounded-md p-2 text-gray-600 bg-gray-100">
                    Discussion Room (Student Access)
                  </div>
                ) : (
                  <select
                    className="w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {uniqueTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                )}
              </div>
  
              {/* Capacity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Minimum Capacity</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                  value={filterCapacity}
                  onChange={(e) => setFilterCapacity(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">Any Capacity</option>
                  <option value="5">5+ People</option>
                  <option value="10">10+ People</option>
                  <option value="20">20+ People</option>
                  <option value="50">50+ People</option>
                  <option value="100">100+ People</option>
                </select>
              </div>
  
              {/* Building Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Building</label>
                <select
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                  value={filterBuilding}
                  onChange={(e) => setFilterBuilding(e.target.value)}
                >
                  <option value="">All Buildings</option>
                  {uniqueBuildings.map((building) => (
                    <option key={building} value={building}>{building}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Availability Filters */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-md mb-3 text-gray-900">Availability Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-900 appearance-none"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
  
                {/* Start Time Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Start Time</label>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                    value={filterStartTime}
                    onChange={(e) => setFilterStartTime(e.target.value)}
                  >
                    <option value="">Any Start Time</option>
                    {generateTimeOptions()}
                  </select>
                </div>
  
                {/* End Time Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">End Time</label>
                  <select
                    className="w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                    value={filterEndTime}
                    onChange={(e) => setFilterEndTime(e.target.value)}
                    disabled={!filterStartTime} // Disable if no start time selected
                  >
                    <option value="">Any End Time</option>
                    {filterStartTime && generateTimeOptions().filter(option => 
                      option.props.value > filterStartTime
                    )}
                  </select>
                </div>
  
                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <button 
                    onClick={clearTimeFilters}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-150"
                  >
                    Reset Time Filters
                  </button>
                </div>
              </div>
              
              {/* Availability Status */}
              {filterDate && filterStartTime && (
                <div className="mt-3 text-sm text-blue-600">
                  Showing rooms available on {new Date(filterDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  {filterStartTime && ` from ${filterStartTime}`}
                  {filterEndTime && ` to ${filterEndTime}`}
                </div>
              )}
            </div>
          </div>
  
          {/* Room Listings */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading rooms...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          ) : (
            <>
              <p className="mb-4 text-gray-600">
                {isStudent 
                  ? `Showing ${filteredRooms.length} available discussion ${filteredRooms.length === 1 ? 'room' : 'rooms'}`
                  : `Showing ${filteredRooms.length} out of ${rooms.length} rooms`
                }
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <div key={room.room_id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="flex flex-col h-full">
                      {/* Room Image */}
                      <div className="h-48 relative">
                        <img
                          src={room.image_url || defaultRoomImage}
                          alt={`${room.room_name} - ${room.room_type}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Room Details */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">{room.room_name}</h3>
                          {/* Status badge changes based on is_active */}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          room.is_active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {room.is_active ? "Available" : "Unavailable"}
                        </span>
                        </div>
                        
                        <div className="mb-4 space-y-2">
                          <p className="flex items-center text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{room.building_name}</span>
                          </p>
                          <p className="flex items-center text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Seats {room.room_seating_capacity} people</span>
                          </p>
                          <p className="flex items-center text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                            </svg>
                            <span>{room.room_type}</span>
                          </p>
                        </div>
                        
                        {room.description && (
                          <p className="text-gray-600 text-sm mb-4 flex-grow">{room.description}</p>
                        )}
                        
                        <div className="mt-auto pt-4 flex space-x-2">
                          
                        <button
                          onClick={() => handleBookRoom(room.room_id)}
                          className={`flex-1 font-medium py-2 px-4 rounded transition duration-150 ${
                            room.is_active 
                              ? "bg-blue-600 hover:bg-blue-700 text-white" 
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                          disabled={!room.is_active}
                        >
                          {room.is_active ? "Book Room" : "Unavailable"}
                        </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredRooms.length === 0 && !loading && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No rooms match your filters</h3>
                  <p className="mt-2 text-gray-500">Try adjusting your search criteria or clear filters to see more rooms.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        roomId={selectedRoomId}
        onBookingSuccess={handleBookingSuccess}
        selectedDate={filterDate}
        selectedStartTime={filterStartTime}
        selectedEndTime={filterEndTime}
      />
    </div>
  );
};

export default RoomListings;