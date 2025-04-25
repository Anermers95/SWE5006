import { useState, useEffect } from "react";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number | null;
  onBookingSuccess: () => void;
  selectedDate?: string;
  selectedStartTime?: string;
  selectedEndTime?: string;
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

interface BookingData {
  booking_id: number;
  room_id: number;
  start_time: string;
  end_time: string;
  status: string;
}

const getDurationText = (startTime: string, endTime: string): string => {
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  
  // Calculate hours (end time is exclusive)
  const hours = endHour - startHour;
  
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
};
const BookingModal = ({ 
  isOpen, 
  onClose, 
  roomId, 
  onBookingSuccess,
  selectedDate,
  selectedStartTime: preselectedStartTime,
  selectedEndTime: preselectedEndTime
}: BookingModalProps) => {
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
  const [bookedSlots, setBookedSlots] = useState<{[date: string]: string[]}>({});
  const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([]);
  const [allBookings, setAllBookings] = useState<BookingData[]>([]);
  const [availableDates, setAvailableDates] = useState<{[date: string]: boolean}>({});
  const [dateWarning, setDateWarning] = useState<string>("");

  // Apply preselected values when modal opens
  useEffect(() => {
    if (isOpen) {
      // Set preselected date if provided
      if (selectedDate) {
        setDate(selectedDate);
      } else {
        setDate(new Date().toISOString().split('T')[0]);
      }

      // Set preselected start time if provided
      if (preselectedStartTime) {
        setSelectedStartTime(preselectedStartTime);
      }

      // Set preselected end time if provided
      if (preselectedEndTime) {
        setSelectedEndTime(preselectedEndTime);
      }
    }
  }, [isOpen, selectedDate, preselectedStartTime, preselectedEndTime]);


  useEffect(() => {
    if (isOpen && roomId) {
      fetchRoomDetails();
      fetchAllBookings();
    }
  }, [isOpen, roomId]);

  // When date changes, update the time slots
  useEffect(() => {
    if (date) {
      updateTimeSlots(date);
      checkDateAvailability(date);
    }
  }, [date, allBookings]);

  const fetchRoomDetails = async () => {
    if (!roomId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/rooms/${roomId}`);
      setRoom(response.data);
    } catch (err) {
      console.error("Error fetching room details:", err);
      setError("Failed to load room details.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all bookings for the room
  const fetchAllBookings = async () => {
    if (!roomId) return;
    
    try {
      // Get all bookings
      const response = await axios.get(`${API_URL}/booking`);
      
      // Filter bookings for this room that are not cancelled
      const roomBookings = response.data.filter((booking: BookingData) => 
        booking.room_id === roomId && booking.status !== 'cancelled'
      );
      
      setAllBookings(roomBookings);
      
      // Process bookings to determine availability
      processBookingsData(roomBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load room availability.");
    }
  };

// Updated generateTimeSlots function that only provides hourly slots
const generateTimeSlots = () => {
  const slots: TimeSlot[] = [];
  // Start at 9am, end at 9pm
  for (let hour = 9; hour <= 21; hour++) { 
    const hourStr = hour.toString().padStart(2, '0');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    
    slots.push({
      id: `${hourStr}:00`,
      label: `${displayHour}:00 ${ampm}`,
      value: `${hourStr}:00`,
      disabled: false
    });
  }
  return slots;
};

// Updated processBookingsData function with hourly slots only
const processBookingsData = (bookings: BookingData[]) => {
  const bookedSlotsByDate: {[date: string]: string[]} = {};
  const fullyBooked: string[] = [];
  // Total possible hourly slots (9 AM to 9 PM)
  const totalSlotsPerDay = (21 - 9 + 1); 
  
  bookings.forEach(booking => {
    // Extract date from the booking
    const bookingDate = booking.start_time.split('T')[0];
    
    // Initialize array if needed
    if (!bookedSlotsByDate[bookingDate]) {
      bookedSlotsByDate[bookingDate] = [];
    }
    
    // Parse start and end times
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);
    
    // Get UTC hours directly to avoid timezone issues
    const startHour = startTime.getUTCHours();
    const endHour = endTime.getUTCHours();
    
    console.log(`Processing booking: ${bookingDate} ${startHour}:00 - ${endHour}:00`);
    
    // Mark every hour from start time up to (but normally not including) end time as booked
    for (let hour = startHour; hour <= endHour; hour++) {
      // Only add slots within our 9 AM to 9 PM range
      if (hour >= 9 && hour <= 21) {
        // Special handling: Include end hour (endHour) only if it's the last time slot (9 PM/21:00)
        if (hour < endHour || endHour === 21) {
          const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
          
          // Add to booked slots if not already there
          if (!bookedSlotsByDate[bookingDate].includes(timeSlot)) {
            bookedSlotsByDate[bookingDate].push(timeSlot);
            console.log(`Marking as booked: ${bookingDate} ${timeSlot}`);
          }
        }
      }
    }
  });
  
  // Determine fully booked dates
  for (const [dateStr, slots] of Object.entries(bookedSlotsByDate)) {
    console.log(`Date ${dateStr} has ${slots.length} booked slots out of ${totalSlotsPerDay} total slots`);
    console.log(`Booked slots: ${slots.join(', ')}`);
    
    // If date has most or all slots booked (allowing for some buffer)
    if (slots.length >= totalSlotsPerDay - 1) { // Consider fully booked if <1 slots available
      fullyBooked.push(dateStr);
    }
  }
  
  setBookedSlots(bookedSlotsByDate);
  setFullyBookedDates(fullyBooked);
  
  // Update time slots for current date
  updateTimeSlots(date);
};

const getAvailableEndTimes = () => {
  if (!selectedStartTime) return [];
  
  const startHour = parseInt(selectedStartTime.split(':')[0]);
  
  // Max duration is 2 hours EXCLUSIVE of the end hour
  // So for a 2-hour booking from 9am, the end time should be 11am
  const maxDuration = 2; // 2 hour maximum
  const maxEndHour = Math.min(startHour + maxDuration, 21); // Maximum 9 PM
  
  const endTimes = [];
  const bookedForDate = bookedSlots[date] || [];
  
  // Start from the next hour and include up to 2 hours total
  for (let hour = startHour + 1; hour <= maxEndHour; hour++) {
    const hourStr = hour.toString().padStart(2, '0');
    const timeSlot = `${hourStr}:00`;
    
    // Check if any hour in the range is booked
    let isRangeBooked = false;
    for (let checkHour = startHour + 1; checkHour < hour; checkHour++) {
      const checkSlot = `${checkHour.toString().padStart(2, '0')}:00`;
      if (bookedForDate.includes(checkSlot)) {
        isRangeBooked = true;
        break;
      }
    }
    
    // Add to available end times if not booked
    if (!isRangeBooked) {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      
      // Calculate duration for display
      const duration = hour - startHour;
      
      endTimes.push({
        id: timeSlot,
        label: `${displayHour}:00 ${ampm} (${duration} hour${duration !== 1 ? 's' : ''})`,
        value: timeSlot,
        disabled: false
      });
    }
  }
  
  return endTimes;
};

  // Check if a date is fully booked
  const checkDateAvailability = (dateStr: string) => {
    if (fullyBookedDates.includes(dateStr)) {
      setDateWarning("Warning: This date has limited or no available time slots.");
    } else {
      setDateWarning("");
    }
  };

  // Update time slots for a specific date
  const updateTimeSlots = (dateStr: string) => {
    const slots = generateTimeSlots();
    
    // Check if we have booked slots for this date
    const bookedForDate = bookedSlots[dateStr] || [];
    
    // Mark slots as disabled if they're booked
    const updatedSlots = slots.map(slot => ({
      ...slot,
      disabled: bookedForDate.includes(slot.value)
    }));
    
    setTimeSlots(updatedSlots);
    
    // If all or nearly all slots are booked, show a warning
    if (bookedForDate.length >= slots.length - 2) {
      setDateWarning("Warning: This date has limited or no available time slots.");
    } else {
      setDateWarning("");
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);
    
    // Reset time selections when date changes
    setSelectedStartTime("");
    setSelectedEndTime("");
    
    // Check if this date is fully booked
    checkDateAvailability(newDate);
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!room || !selectedStartTime || !selectedEndTime || !bookingTitle) {
      setSuccess(false);
      setMessage("Please fill in all required fields.");
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => setMessage(""), 5000);
      return;
    }
    
    try {
      const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
      const userId = userData.user_id;
      
      if (!userId) {
        setSuccess(false);
        setMessage("You must be logged in to book a room.");
        
        // Auto-hide error message after 5 seconds
        setTimeout(() => setMessage(""), 5000);
        return;
      }
      
      // Create start/end times without timezone conversion
      // Format strings directly in the format the API expects
      const [startHour, startMinute = "00"] = selectedStartTime.split(':');
      const [endHour, endMinute = "00"] = selectedEndTime.split(':');
      
      // Format as ISO-like strings but preserve the exact hours specified
      // This prevents timezone conversion
      const startDateTime = `${date}T${startHour}:${startMinute}:00.000Z`;
      const endDateTime = `${date}T${endHour}:${endMinute}:00.000Z`;
      
      console.log("Submitting booking with times:", {
        originalStartTime: selectedStartTime,
        originalEndTime: selectedEndTime,
        startDateTime,
        endDateTime
      });
      
      const response = await axios.post(`${API_URL}/booking`, {
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
        // Redirect to home page after successful booking
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err: any) {
      setSuccess(false);
      setMessage(err.response?.data?.message || "Failed to create booking. Please try again.");
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => setMessage(""), 5000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      
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
                  <div className="w-1/2 relative">
                    <input
                      type="date"
                      className={`w-full border ${
                        fullyBookedDates.includes(date) 
                          ? "border-yellow-300 bg-yellow-50" 
                          : "border-gray-300"
                      } rounded-md p-2 text-gray-900 appearance-none`}
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
                            disabled={slot.disabled}
                            style={{color: slot.disabled ? '#D1D5DB' : 'inherit'}}
                          >
                            {slot.label}{slot.disabled ? ' (Booked)' : ''}
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
                
                {dateWarning && (
                  <p className="mt-1 text-sm text-amber-600 font-medium">
                    {dateWarning}
                  </p>
                )}
                
                {/* Add a clear explanation box */}
                {selectedStartTime && selectedEndTime && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Booking:</strong> From {
                        (() => {
                          const startHour = parseInt(selectedStartTime.split(':')[0]);
                          const displayStartHour = startHour > 12 ? startHour - 12 : startHour;
                          const startAmPm = startHour >= 12 ? 'PM' : 'AM';
                          
                          const endHour = parseInt(selectedEndTime.split(':')[0]);
                          const displayEndHour = endHour > 12 ? endHour - 12 : endHour;
                          const endAmPm = endHour >= 12 ? 'PM' : 'AM';
                          
                          return `${displayStartHour}:00 ${startAmPm} to ${displayEndHour}:00 ${endAmPm}`;
                        })()
                      }
                      <br />
                      <strong>Duration:</strong> {getDurationText(selectedStartTime, selectedEndTime)}
                    </p>
                  </div>
                )}
                
                <p className="mt-2 text-xs text-gray-500">
                  Note: Time slots that are already booked will appear grayed out and cannot be selected.
                </p>
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
                <div className="fixed top-4 right-4 z-50">
                  <div className="flex w-full max-w-sm overflow-hidden bg-white rounded-lg shadow-md dark:bg-gray-800">
                    <div className={`flex items-center justify-center w-12 ${success ? "bg-emerald-500" : "bg-red-500"}`}>
                      <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        {success ? (
                          <path d="M20 3.33331C10.8 3.33331 3.33337 10.8 3.33337 20C3.33337 29.2 10.8 36.6666 20 36.6666C29.2 36.6666 36.6667 29.2 36.6667 20C36.6667 10.8 29.2 3.33331 20 3.33331ZM16.6667 28.3333L8.33337 20L10.6834 17.65L16.6667 23.6166L29.3167 10.9666L31.6667 13.3333L16.6667 28.3333Z" />
                        ) : (
                          <path d="M20 3.36667C10.8167 3.36667 3.3667 10.8167 3.3667 20C3.3667 29.1833 10.8167 36.6333 20 36.6333C29.1834 36.6333 36.6334 29.1833 36.6334 20C36.6334 10.8167 29.1834 3.36667 20 3.36667ZM19.1334 33.3333V22.9H13.3334L21.6667 6.66667V17.1H27.25L19.1334 33.3333Z" />
                        )}
                      </svg>
                    </div>
                    <div className="px-4 py-2 -mx-3">
                      <div className="mx-3">
                        <span className={`font-semibold ${success ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                          {success ? "Success" : "Error"}
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-200">
                          {message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
                >
                  Confirm Booking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Reset form state
                    setSelectedStartTime("");
                    setSelectedEndTime("");
                    setBookingTitle("");
                    setMessage("");
                    // Close the modal
                    onClose();
                  }}
                  className="px-5 py-2 bg-gray-500 text-white font-medium rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
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