import { useState, useEffect } from "react";
import axios from "axios";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number | null;
  onBookingSuccess: () => void;
}

interface Room {
  room_id: number;
  room_name: string;
  room_type: string;
  building_name: string;
  room_seating_capacity: number;
}

interface TimeSlot {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
}

const BookingModal = ({ isOpen, onClose, roomId, onBookingSuccess }: BookingModalProps) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
  const [bookingTitle, setBookingTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  // Generate time slots from 8 AM to 10 PM (14 hours)
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour <= 22; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      slots.push({
        id: `${hourStr}:00`,
        label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
        value: `${hourStr}:00`,
        disabled: false
      });
    }
    return slots;
  };

  useEffect(() => {
    if (isOpen && roomId) {
      fetchRoomDetails();
      fetchBookedSlots();
      const slots = generateTimeSlots();
      setTimeSlots(slots);
    }
  }, [isOpen, roomId, date]);

  const fetchRoomDetails = async () => {
    if (!roomId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/rooms/${roomId}`);
      setRoom(response.data);
    } catch (err) {
      console.error("Error fetching room details:", err);
      setError("Failed to load room details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedSlots = async () => {
    if (!roomId) return;
    
    try {
      // Get bookings for this room on the selected date
      const response = await axios.get(`http://localhost:3000/booking/room/${roomId}`);
      
      // Filter bookings for the selected date
      const bookingsForDate = response.data.filter((booking: any) => {
        const bookingDate = new Date(booking.start_time).toISOString().split('T')[0];
        return bookingDate === date && booking.is_active;
      });
      
      // Create array of booked time slots
      const bookedTimes: string[] = [];
      bookingsForDate.forEach((booking: any) => {
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        
        let currentHour = startTime.getHours();
        while (currentHour < endTime.getHours()) {
          bookedTimes.push(`${currentHour.toString().padStart(2, '0')}:00`);
          currentHour++;
        }
      });
      
      setBookedSlots(bookedTimes);
      
      // Update time slots availability
      setTimeSlots(prev => 
        prev.map(slot => ({
          ...slot,
          disabled: bookedTimes.includes(slot.value)
        }))
      );
    } catch (err) {
      console.error("Error fetching booked slots:", err);
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const startTime = e.target.value;
    setSelectedStartTime(startTime);
    
    // If we already have an end time selected, verify it's still valid
    if (selectedEndTime) {
      const startHour = parseInt(startTime.split(':')[0]);
      const endHour = parseInt(selectedEndTime.split(':')[0]);
      
      // Reset end time if it's less than or equal to start time
      if (endHour <= startHour) {
        setSelectedEndTime("");
      }
      
      // Reset end time if the duration is > 4 hours
      if (endHour - startHour > 4) {
        setSelectedEndTime("");
      }
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const endTime = e.target.value;
    setSelectedEndTime(endTime);
  };

  const getAvailableEndTimes = () => {
    if (!selectedStartTime) return [];
    
    const startHour = parseInt(selectedStartTime.split(':')[0]);
    const maxDuration = 4; // 4 hour maximum
    const maxEndHour = Math.min(startHour + maxDuration, 22); // Maximum 10 PM
    
    const endTimes = [];
    
    for (let hour = startHour + 1; hour <= maxEndHour; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      const slot = `${hourStr}:00`;
      
      // Only include if the slot isn't booked (unless it's the currently selected end time)
      if (!bookedSlots.includes(slot) || slot === selectedEndTime) {
        endTimes.push({
          id: slot,
          label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
          value: slot,
          disabled: false
        });
      } else {
        // If we hit a booked slot, we can't go beyond this
        break;
      }
    }
    
    return endTimes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!room || !selectedStartTime || !selectedEndTime || !bookingTitle) {
      setSuccess(false);
      setMessage("Please fill in all required fields.");
      return;
    }
    
    // Convert date and times to ISO format
    const startDateTime = `${date}T${selectedStartTime}:00`;
    const endDateTime = `${date}T${selectedEndTime}:00`;
    
    try {
      const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
      const userId = userData.user_id;
      
      if (!userId) {
        setSuccess(false);
        setMessage("You must be logged in to book a room.");
        return;
      }
      
      const response = await axios.post("http://localhost:3000/booking", {
        userId,
        roomId: room.room_id,
        startTime: startDateTime,
        endTime: endDateTime,
        bookingPurpose: bookingTitle
      });
      
      setSuccess(true);
      setMessage("Booking confirmed successfully!");
      
      // Reset form
      setTimeout(() => {
        setSelectedStartTime("");
        setSelectedEndTime("");
        setBookingTitle("");
        onBookingSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setSuccess(false);
      setMessage(err.response?.data?.message || "Failed to create booking. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
        
        {/* Modal content */}
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg z-10 mx-4">
            <div className="bg-gray-800 text-white py-3 px-4 rounded-t-lg">
            <h2 className="text-lg font-medium">NEW BOOKING</h2>
            </div>
            
            <div className="p-6">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Loading room details...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : room ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h3 className="font-medium mb-2 text-gray-900">Room Details</h3>
                <p className="text-gray-800"><span className="font-medium">Room:</span> {room.room_name}</p>
                <p className="text-gray-800"><span className="font-medium">Type:</span> {room.room_type}</p>
                <p className="text-gray-800"><span className="font-medium">Building:</span> {room.building_name}</p>
                <p className="text-gray-800"><span className="font-medium">Capacity:</span> {room.room_seating_capacity} people</p>
              </div>
              
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">DATE & TIME</h3>
                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="flex-1 flex space-x-2">
                    <div className="flex-1">
                      <select
                        className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
                        value={selectedStartTime}
                        onChange={handleStartTimeChange}
                        required
                      >
                        <option value="">Select start time</option>
                        {timeSlots.map((slot) => (
                          <option 
                            key={slot.id} 
                            value={slot.value}
                            disabled={slot.disabled}
                          >
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedStartTime && (
                      <>
                        <div className="pt-2 text-gray-800">to</div>
                        <div className="flex-1">
                          <select
                            className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
                            value={selectedEndTime}
                            onChange={handleEndTimeChange}
                            required
                          >
                            <option value="">Select end time</option>
                            {getAvailableEndTimes().map((slot) => (
                              <option 
                                key={slot.id} 
                                value={slot.value}
                                disabled={slot.disabled}
                              >
                                {slot.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {selectedStartTime && selectedEndTime && (
                  <p className="mt-1 text-sm text-gray-600">
                    Duration: {parseInt(selectedEndTime) - parseInt(selectedStartTime)} hour(s)
                  </p>
                )}
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">BOOKING TITLE</h3>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
                  value={bookingTitle}
                  onChange={(e) => setBookingTitle(e.target.value)}
                  placeholder="Enter booking title"
                  required
                />
              </div>
              
                        {message && (
            <div
                className={`flex w-full overflow-hidden rounded-lg shadow-md mb-4 ${
                success ? "bg-emerald-50 border border-emerald-500" : "bg-red-50 border border-red-500"
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
                        ? "text-emerald-500"
                        : "text-red-500"
                    }`}
                    >
                    {success ? "Success" : "Error"}
                    </span>
                    <p className="text-sm text-gray-800">
                    {message}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setMessage("")}
                    className="text-gray-600 hover:text-gray-800 font-bold"
                >
                    ✖
                </button>
                </div>
            </div>
            )}
              
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-500 text-white font-medium rounded hover:bg-green-600 transition-colors"
                >
                  Confirm booking
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-green-500 text-white font-medium rounded hover:bg-green-600 transition-colors"
                >
                  Cancel booking
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <p>No room selected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;