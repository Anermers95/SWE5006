import { useState, useEffect } from "react";
import axios from "axios";

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

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  onEditSuccess: () => void;
}

interface TimeSlot {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
}

// Updated to match hourly calculation with inclusive hours
const getDurationText = (startTime: string, endTime: string): string => {
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  
  // Calculate hours accounting for an inclusive end time
  const hours = endHour - startHour + 1;
  
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
};

const EditBookingModal = ({ isOpen, onClose, booking, onEditSuccess }: EditBookingModalProps) => {
  const [room, setRoom] = useState<any>(null);
  const [date, setDate] = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
  const [bookingTitle, setBookingTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize form with booking data
  useEffect(() => {
    if (isOpen && booking) {
      fetchRoomDetails();
      
      // Extract date from booking start time
      const bookingDate = new Date(booking.start_time).toISOString().split('T')[0];
      setDate(bookingDate);
      
      // Extract hours and minutes directly from the UTC times stored in the database
      const startDate = new Date(booking.start_time);
      const endDate = new Date(booking.end_time);
      
      // Get the hours directly - do NOT apply timezone offset
      const startHour = startDate.getUTCHours().toString().padStart(2, '0');
      // For hourly slots, always use 00 minutes
      const startTime = `${startHour}:00`;
      
      const endHour = endDate.getUTCHours().toString().padStart(2, '0');
      const endTime = `${endHour}:00`;
      
      console.log("Setting times from UTC values:", { 
        startOriginal: booking.start_time,
        endOriginal: booking.end_time,
        startHour,
        endHour
      });
      
      setSelectedStartTime(startTime);
      setSelectedEndTime(endTime);
      setBookingTitle(booking.booking_purpose);
      
      // Generate time slots and fetch booked slots
      fetchBookedSlots(bookingDate);
    }
  }, [isOpen, booking]);
  
  const fetchRoomDetails = async () => {
    if (!booking.room_id) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/rooms/${booking.room_id}`);
      setRoom(response.data);
    } catch (err) {
      console.error("Error fetching room details:", err);
      setError("Failed to load room details.");
    } finally {
      setLoading(false);
    }
  };
  
  // Generate time slots from 8 AM to 10 PM (hourly only)
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    for (let hour = 8; hour <= 22; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
      
      slots.push({
        id: `${hourStr}:00`,
        label: `${displayHour}:00 ${ampm}`,
        value: `${hourStr}:00`,
        disabled: false
      });
    }
    return slots;
  };
  
  // Fetch booked time slots
  const fetchBookedSlots = async (selectedDate: string) => {
    try {
      // Get all bookings
      const response = await axios.get('http://localhost:3000/booking');
      
      // Filter bookings for the selected date, excluding the current booking
      const bookingsForDate = response.data.filter((b: any) => {
        const bookingDate = b.start_time.split('T')[0];
        return bookingDate === selectedDate && 
               b.status !== 'cancelled' && 
               b.booking_id !== booking.booking_id;
      });
      
      // Create array of booked time slots
      const bookedTimes: string[] = [];
      bookingsForDate.forEach((b: any) => {
        const startTime = new Date(b.start_time);
        const endTime = new Date(b.end_time);
        
        // Use UTC hours to avoid timezone issues
        const startHour = startTime.getUTCHours();
        const endHour = endTime.getUTCHours();
        
        console.log(`Processing booking: ${startHour}:00 - ${endHour}:00`);
        
        // Mark every hour from start time to end time as booked (inclusive)
        for (let hour = startHour; hour <= endHour; hour++) {
          // Only add slots within our 8 AM to 10 PM range
          if (hour >= 8 && hour <= 22) {
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
            
            // Add to booked slots if not already there
            if (!bookedTimes.includes(timeSlot)) {
              bookedTimes.push(timeSlot);
              console.log(`Marking as booked: ${timeSlot}`);
            }
          }
        }
      });
      
      setBookedSlots(bookedTimes);
      
      // Generate and update time slots
      const slots = generateTimeSlots();
      setTimeSlots(slots.map(slot => ({
        ...slot,
        disabled: bookedTimes.includes(slot.value)
      })));
      
    } catch (err) {
      console.error("Error fetching booked slots:", err);
      setMessage("Error loading available time slots. Please try again.");
      setSuccess(false);
    }
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    fetchBookedSlots(newDate);
    // Reset times when date changes
    setSelectedStartTime("");
    setSelectedEndTime("");
  };
  
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const startTime = e.target.value;
    setSelectedStartTime(startTime);
    
    // Reset end time when start time changes
    setSelectedEndTime("");
  };
  
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const endTime = e.target.value;
    setSelectedEndTime(endTime);
  };
  
  // Updated to match the booking modal's hourly approach
  const getAvailableEndTimes = () => {
    if (!selectedStartTime) return [];
    
    const startHour = parseInt(selectedStartTime.split(':')[0]);
    
    // For a 4-hour booking starting at 1pm, the end time should be 4pm
    // This means the maximum end hour is startHour + 3
    const maxEndHour = Math.min(startHour + 3, 22); // 4-hour maximum (inclusive), limited to 10 PM
    
    const endTimes = [];
    
    // Start from the next hour
    for (let hour = startHour + 1; hour <= maxEndHour; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      const timeSlot = `${hourStr}:00`;
      
      // Check if this time is booked
      const isBooked = bookedSlots.includes(timeSlot);
      
      // Add to available end times if not booked
      if (!isBooked) {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        
        endTimes.push({
          id: timeSlot,
          label: `${displayHour}:00 ${ampm}`,
          value: timeSlot,
          disabled: false
        });
      } else {
        // If we hit a booked slot, we can't go beyond this
        break;
      }
    }
    
    return endTimes;
  };
  
  // Format 24-hour time to 12-hour format
  const format12HourTime = (time24hr: string) => {
    const [hourStr, minuteStr] = time24hr.split(':');
    const hour = parseInt(hourStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minuteStr} ${ampm}`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Format the date as "1st April 2025"
    const day = date.getUTCDate();
    
    // Add appropriate suffix to day
    let daySuffix = "th";
    if (day === 1 || day === 21 || day === 31) {
      daySuffix = "st";
    } else if (day === 2 || day === 22) {
      daySuffix = "nd";
    } else if (day === 3 || day === 23) {
      daySuffix = "rd";
    }
    
    // Get month name
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[date.getUTCMonth()];
    
    // Get year
    const year = date.getUTCFullYear();
    
    return `${day}${daySuffix} ${month} ${year}`;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !selectedStartTime || !selectedEndTime || !bookingTitle) {
      setSuccess(false);
      setMessage("Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    
    try {
      // Parse the selected times
      const [startHourStr, startMinute = "00"] = selectedStartTime.split(':');
      const [endHourStr, endMinute = "00"] = selectedEndTime.split(':');
      
      // Create the datetime strings with the proper format
      const startDateTime = `${date}T${startHourStr}:${startMinute}:00.000Z`;
      const endDateTime = `${date}T${endHourStr}:${endMinute}:00.000Z`;
      
      console.log("Submitting booking update with:", {
        bookingId: booking.booking_id,
        startDateTime,
        endDateTime,
        bookingTitle
      });
      
      // IMPORTANT: Use camelCase property names to match what your controller expects
      const response = await axios.put(`http://localhost:3000/booking/${booking.booking_id}`, {
        startTime: startDateTime,     // camelCase to match controller
        endTime: endDateTime,         // camelCase to match controller
        bookingPurpose: bookingTitle, // camelCase to match controller
        isActive: true                // camelCase to match controller
      });
      
      console.log("Update response:", response.data);
      
      setSuccess(true);
      setMessage("Booking updated successfully!");
      
      // Notify parent and close modal after a delay
      setTimeout(() => {
        onEditSuccess();
        onClose();
      }, 1500);
      
    } catch (err: any) {
      setSuccess(false);
      console.error("Error updating booking:", err.response?.data || err);
      setMessage(err.response?.data?.message || "Failed to update booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      
      {/* Modal content */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg z-10 mx-4">
        <div className="bg-gray-800 text-white py-3 px-4 rounded-t-lg">
          <h2 className="text-lg font-medium">EDIT BOOKING</h2>
        </div>
        
        <div className="p-6">
          {loading && !room ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Loading room details...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h3 className="font-medium mb-2 text-gray-900">Room Details</h3>
                <p className="text-gray-800"><span className="font-medium">Room:</span> {booking.room_name}</p>
                <p className="text-gray-800"><span className="font-medium">Type:</span> {booking.room_type}</p>
                <p className="text-gray-800"><span className="font-medium">Building:</span> {booking.building_name}</p>
                <p className="text-gray-800"><span className="font-medium">Capacity:</span> {booking.room_seating_capacity} people</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">DATE & TIME</h3>
                <div className="flex space-x-2">
                  <div className="w-1/2 relative">
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md p-2 text-gray-900 appearance-none"
                      value={date}
                      onChange={handleDateChange}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
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
                            disabled={slot.disabled && slot.value !== selectedStartTime}
                            style={{color: slot.disabled && slot.value !== selectedStartTime ? '#D1D5DB' : 'inherit'}}
                          >
                            {slot.label}{slot.disabled && slot.value !== selectedStartTime ? ' (Booked)' : ''}
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
                                style={{color: slot.disabled ? '#D1D5DB' : 'inherit'}}
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
                    Duration: {getDurationText(selectedStartTime, selectedEndTime)}
                  </p>
                )}
                
                <p className="mt-2 text-sm text-blue-600">
                  Current booking: {formatDate(booking.start_time)}, {selectedStartTime && selectedEndTime ? 
                    `${format12HourTime(selectedStartTime)} - ${format12HourTime(selectedEndTime)}` : 
                    "Time not selected"}
                </p>
                
                <p className="mt-2 text-xs text-gray-500">
                  Note: Time slots that are already booked will appear grayed out and cannot be selected.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">BOOKING PURPOSE</h3>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-2 text-gray-900"
                  value={bookingTitle}
                  onChange={(e) => setBookingTitle(e.target.value)}
                  placeholder="Enter booking purpose"
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
                  className="px-5 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Booking'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-gray-500 text-white font-medium rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditBookingModal;