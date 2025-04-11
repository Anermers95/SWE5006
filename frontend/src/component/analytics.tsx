import { useEffect, useState } from "react";
import Navbar from "./navbar";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
// Define interfaces based on your data structure
interface BookingData {
  booking_id: number;
  user_id: number;
  room_id: number;
  start_time: string;
  end_time: string;
  booking_purpose?: string;
  is_active: boolean;
  created_on: string;
  updated_on: string;
}

interface UserData {
  user_id: number;
  user_email: string;
  user_full_name: string;
  user_role_id: number;
  is_active: boolean;
}

interface RoomData {
  room_id: number;
  room_name: string;
  room_type: string;
  building_name: string;
  room_seating_capacity: number;
  is_active: boolean;
}

// Analytics interfaces
interface BookingMetric {
  value: string | number;
  percentChange: number;
  label: string;
}
interface DailyBooking {
  day: number;
  count: number;
}

interface TopRoom {
  room_name: string;
  bookings: number;
}

interface TopUser {
  user_name: string;
  bookings: number;
}

interface TopBuilding {
  building_name: string;
  bookings: number;
}
const getStartOfWeek = (date: Date): Date => {
  const day = date.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = (day === 0 ? -6 : 1) - day; // Adjust if week starts on Monday
  const start = new Date(date);
  start.setDate(date.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfWeek = (start: Date): Date => {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

const addWeeks = (date: Date, numWeeks: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + numWeeks * 7);
  return getStartOfWeek(newDate);
};

const formatDateRange = (start: Date, end: Date): string => {
  return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
};
const Analytics = () => {
  // State for data
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [weekdayBookings, setWeekdayBookings] = useState<number[]>([]);
  const [timeOfWeekBookings, setTimeOfWeekBookings] = useState<number[][]>([]);
  const [weeklyBookingCards, setWeeklyBookingCards] = useState<BookingData[]>([]);


  // State for derived analytics
  const [metrics, setMetrics] = useState<BookingMetric[]>([]);
  const [dailyBookings, setDailyBookings] = useState<DailyBooking[]>([]);
  const [topRooms, setTopRooms] = useState<TopRoom[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [topBuildings, setTopBuildings] = useState<TopBuilding[]>([]);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  // Date range filter
  const [dateRange, setDateRange] = useState<string>("30 days");
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    if (bookings.length > 0 && rooms.length > 0 && users.length > 0) {
      calculateAnalytics();
    }
  }, [bookings, rooms, users, currentWeekStart]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all necessary data
      const [bookingsRes, usersRes, roomsRes] = await Promise.all([
        axios.get(`${API_URL}3000/booking`),
        axios.get(`${API_URL}3000/users`),
        axios.get(`${API_URL}3000/rooms`)
      ]);
      
      setBookings(bookingsRes.data);
      setUsers(usersRes.data);
      setRooms(roomsRes.data);
      
      console.log(`Fetched ${bookingsRes.data.length} bookings, ${usersRes.data.length} users, and ${roomsRes.data.length} rooms`);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load analytics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    // Filter bookings based on selected date range
    const weekStartUTC = new Date(Date.UTC(
      currentWeekStart.getFullYear(),
      currentWeekStart.getMonth(),
      currentWeekStart.getDate()
    ));
    const weekEndUTC = new Date(weekStartUTC);
    weekEndUTC.setUTCDate(weekStartUTC.getUTCDate() + 6);
    weekEndUTC.setUTCHours(23, 59, 59, 999);
    
    // Bookings in current week
    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.start_time);
      return bookingDate >= weekStartUTC && bookingDate <= weekEndUTC;
    });
    
    // Previous week
    const previousWeekStartUTC = new Date(weekStartUTC);
    previousWeekStartUTC.setUTCDate(weekStartUTC.getUTCDate() - 7);
    const previousWeekEndUTC = new Date(weekEndUTC);
    previousWeekEndUTC.setUTCDate(weekEndUTC.getUTCDate() - 7);
    
    const previousPeriodBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.start_time);
      return bookingDate >= previousWeekStartUTC && bookingDate <= previousWeekEndUTC;
    });
    
    // Get active (not cancelled) bookings
    const activeBookings = filteredBookings.filter(b => b.is_active);
    const previousActiveBookings = previousPeriodBookings.filter(b => b.is_active);
    
    // Calculate total hours
    let totalHours = 0;
    activeBookings.forEach(booking => {
      const start = new Date(booking.start_time).getTime();
      const end = new Date(booking.end_time).getTime();
      const durationHours = (end - start) / (1000 * 60 * 60);
      totalHours += durationHours;
    });
    
    let previousTotalHours = 0;
    previousActiveBookings.forEach(booking => {
      const start = new Date(booking.start_time).getTime();
      const end = new Date(booking.end_time).getTime();
      const durationHours = (end - start) / (1000 * 60 * 60);
      previousTotalHours += durationHours;
    });
    
    // Calculate utilization rate
    const totalRooms = rooms.filter(r => r.is_active).length;
    const availableHoursPerDay = 12; // Assuming 12 hours per day
    const totalAvailableHours = totalRooms * 7 * availableHoursPerDay;
    const utilizationPercent = (totalHours / totalAvailableHours) * 100;
    
    const previousTotalAvailableHours = totalRooms * 7 * availableHoursPerDay;
    const previousUtilizationPercent = (previousTotalHours / previousTotalAvailableHours) * 100;
    
    // Calculate average booking duration
    const avgDuration = activeBookings.length > 0 ? totalHours / activeBookings.length : 0;
    const previousAvgDuration = previousActiveBookings.length > 0 ? 
      previousTotalHours / previousActiveBookings.length : 0;
    
    // Count unique users who made bookings
    const uniqueUserIds = new Set(activeBookings.map(b => b.user_id));
    const previousUniqueUserIds = new Set(previousActiveBookings.map(b => b.user_id));
    
    // Set metrics
    setMetrics([
      {
        value: `${activeBookings.length}`,
        percentChange: previousActiveBookings.length === 0 ? 0 : 
          ((activeBookings.length - previousActiveBookings.length) / previousActiveBookings.length) * 100,
        label: "Total Bookings"
      },
      {
        value: `${Math.round(utilizationPercent)}%`,
        percentChange: previousUtilizationPercent === 0 ? 0 :
          ((utilizationPercent - previousUtilizationPercent) / previousUtilizationPercent) * 100,
        label: "Utilization Rate"
      },
      {
        value: formatDuration(avgDuration),
        percentChange: previousAvgDuration === 0 ? 0 :
          ((avgDuration - previousAvgDuration) / previousAvgDuration) * 100,
        label: "Avg Duration"
      }
    ]);
    // Set active users count
    setActiveUsers(uniqueUserIds.size);
    
    // Calculate daily bookings (for the chart)
    const days = dateRange === "7 days" ? 7 : 
               dateRange === "30 days" ? 30 : 
               dateRange === "24 hours" ? 24 : 31;
    
    const dailyData: DailyBooking[] = [];
    const weekBookings = bookings
      .filter(booking => {
        const date = new Date(booking.start_time);
        return booking.is_active && date >= weekStartUTC && date <= weekEndUTC;
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    setWeeklyBookingCards(weekBookings);
    
    if (dateRange === "24 hours") {
      // For 24 hours, group by hour
      for (let i = 0; i < 24; i++) {
        const hourCutoff = new Date();
        hourCutoff.setHours(hourCutoff.getHours() - (23 - i), 0, 0, 0);
        const nextHour = new Date(hourCutoff);
        nextHour.setHours(nextHour.getHours() + 1);
        
        const count = activeBookings.filter(booking => {
          const bookingDate = new Date(booking.start_time);
          return bookingDate >= hourCutoff && bookingDate < nextHour;
        }).length;
        
        dailyData.push({ day: i + 1, count });
      }
    } else {
      // For days, group by day
      for (let i = 0; i < days; i++) {
        const dayCutoff = new Date();
        dayCutoff.setDate(dayCutoff.getDate() - (days - 1 - i));
        dayCutoff.setHours(0, 0, 0, 0);
        const nextDay = new Date(dayCutoff);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const count = activeBookings.filter(booking => {
          const bookingDate = new Date(booking.start_time);
          return bookingDate >= dayCutoff && bookingDate < nextDay;
        }).length;
        
        dailyData.push({ day: i + 1, count });
      }
    }
    
    setDailyBookings(dailyData);
    
    // Calculate top rooms
    const roomMap = new Map();
    
    activeBookings.forEach(booking => {
      const roomId = booking.room_id;
      roomMap.set(roomId, (roomMap.get(roomId) || 0) + 1);
    });
    
    const roomsData = Array.from(roomMap.entries())
      .map(([roomId, count]) => {
        const room = rooms.find(r => r.room_id === roomId);
        return {
          room_name: room ? room.room_name : `Room #${roomId}`,
          bookings: count as number
        };
      })
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
    
    setTopRooms(roomsData);
    
    // Calculate top users
    const userMap = new Map();
    
    activeBookings.forEach(booking => {
      const userId = booking.user_id;
      userMap.set(userId, (userMap.get(userId) || 0) + 1);
    });
    
    const usersData = Array.from(userMap.entries())
      .map(([userId, count]) => {
        const user = users.find(u => u.user_id === userId);
        return {
          user_name: user ? user.user_full_name : `User #${userId}`,
          bookings: count as number
        };
      })
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
    
    setTopUsers(usersData);
    
    // Calculate top buildings
    const buildingMap = new Map();
    
    activeBookings.forEach(booking => {
      const room = rooms.find(r => r.room_id === booking.room_id);
      if (room) {
        const buildingName = room.building_name;
        buildingMap.set(buildingName, (buildingMap.get(buildingName) || 0) + 1);
      }
    });
    
    const buildingsData = Array.from(buildingMap.entries())
      .map(([building, count]) => ({
        building_name: building,
        bookings: count as number
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
    
    setTopBuildings(buildingsData);
    const startHour = 9;
    const endHour = 21; // exclusive
    const totalSlots = endHour - startHour;

    const weekdayCounts = Array(7).fill(0); // Mon–Sun
    const timeGrid = Array(7).fill(0).map(() => Array(totalSlots).fill(0));

    activeBookings.forEach(booking => {
      const date = new Date(booking.start_time);
      const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000); // Normalize to local time if needed

      // Convert to local if needed (optional)
      const start = new Date(booking.start_time);
      const end = new Date(booking.end_time);

      const day = (start.getUTCDay() + 6) % 7;
      const startHour = start.getUTCHours() ;
      const endHour = end.getUTCHours() ;
      
      if (day >= 0 && day < 7) {
        weekdayCounts[day]++;
        for (let h = startHour; h < endHour; h++) {
          const slot = h - 9; // 9am is the first slot
          if (slot >= 0 && slot <= 12) {
            timeGrid[day][slot]++;
          }
        }
      }

    });


    setWeekdayBookings(weekdayCounts);
    setTimeOfWeekBookings(timeGrid);
  };
  const getWeekDates = (start: Date): string[] => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    });
  };
  
  // Format duration as a readable string (e.g., "2h 30m")
  const formatDuration = (hours: number): string => {
    if (hours === 0) return "0m";
    
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };
  
  // Get maximum value for chart scaling
  const getMaxValue = (): number => {
      if (!dailyBookings.length) return 100;
      return Math.max(...dailyBookings.map(day => day.count)) * 1.2;
    };

  

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Top Navigation */}
      <div className="flex justify-end">
        <Navbar />
      </div>
      
      {/* Main content container */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Space Analytics</h1>
            <p className="text-gray-600 mt-1">
              Room utilization and booking insights
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading analytics data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metrics.map((metric, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-5">
                    <h3 className="text-gray-500 text-sm font-medium">{metric.label}</h3>
                    <div className="flex items-baseline mt-1">
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      <p className={`ml-2 text-sm font-medium ${metric.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.percentChange >= 0 ? '+' : ''}{Math.round(metric.percentChange)}%
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">vs last period</p>
                  </div>
                ))}
              </div>
              
              {/* Date Range Selector */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Analytics</h2>
                  <p className="text-gray-600 text-sm">
                    Booking activity of {formatDateRange(currentWeekStart, getEndOfWeek(currentWeekStart))}
                  </p>
                </div>
                <div className="flex space-x-2 items-center">
                  <button
                    onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, -1))}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentWeekStart(getStartOfWeek(new Date()))}
                    className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  >
                    →
                  </button>
                </div>
              </div>

              
              {/* Booking Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg p-4 shadow h-[400px] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bookings This Week</h3>
                
                {weeklyBookingCards.length === 0 ? (
                  <p className="text-sm text-gray-500">No bookings this week.</p>
                ) : (
                  <div className="space-y-3">
                    {weeklyBookingCards.map((booking, index) => {
                      const room = rooms.find(r => r.room_id === booking.room_id);
                      const user = users.find(u => u.user_id === booking.user_id);
                      const start = new Date(booking.start_time);
                      const end = new Date(booking.end_time);
                      const formattedDate = start.toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        timeZone: 'UTC'
                      });
                      
                      const formattedStart = start.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'UTC'
                      });
                      
                      const formattedEnd = end.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'UTC'
                      });
                      return (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm">
                          <div className="text-sm text-gray-800 font-medium">
                          {formattedDate}, {formattedStart} – {formattedEnd}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            📍 {room?.room_name || `Room #${booking.room_id}`}
                          </div>
                          {booking.booking_purpose && (
                            <div className="text-sm text-gray-500 mt-1 truncate">
                              📝 {booking.booking_purpose}
                            </div>
                          )}
                          {user && (
                            <div className="text-sm text-gray-400 mt-1">
                              👤 {user.user_full_name}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>


                {/* Visualization by Time of Week */}
                <div className="bg-white rounded-lg p-4 shadow overflow-x-auto">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Visualization by Time of Week</h3>
                  <div className="grid grid-cols-7 gap-1">
                    {timeOfWeekBookings.map((day, dayIndex) => (
                      <div key={dayIndex} className="flex flex-col items-center gap-1">
                        {day.map((count, hourIndex) => {
                          const intensity =
                            count > 3 ? "bg-blue-700" :
                            count > 2 ? "bg-blue-500" :
                            count > 1 ? "bg-yellow-400" :
                            count > 0 ? "bg-yellow-200" :
                            "bg-gray-100";

                          return (
                            <div
                              key={`${dayIndex}-${hourIndex}`}
                              className={`w-6 h-6 ${intensity} rounded`}
                              title={`Day ${dayIndex + 1}, ${hourIndex + 9}:00 – ${hourIndex + 10}:00 (${count} bookings)`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>


                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    {getWeekDates(currentWeekStart).map((label, index) => (
                      <span key={index}>{label}</span>
                    ))}
                  </div>
                </div>
              </div>

              
              {/* Top Analytics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Top Rooms */}
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Top Rooms</h3>
                  </div>
                  
                  <div>
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Room
                          </th>
                          <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bookings
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {topRooms.map((room, index) => (
                          <tr key={index}>
                            <td className="py-3 text-sm font-medium text-gray-900">
                              {room.room_name}
                            </td>
                            <td className="py-3 text-sm text-gray-500 text-right">
                              {room.bookings}
                            </td>
                          </tr>
                        ))}
                        {topRooms.length === 0 && (
                          <tr>
                            <td colSpan={2} className="py-3 text-sm text-gray-500 text-center">
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Top Buildings */}
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Top Buildings</h3>
                  </div>
                  
                  <div>
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Building
                          </th>
                          <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bookings
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {topBuildings.map((building, index) => (
                          <tr key={index}>
                            <td className="py-3 text-sm font-medium text-gray-900">
                              {building.building_name}
                            </td>
                            <td className="py-3 text-sm text-gray-500 text-right">
                              {building.bookings}
                            </td>
                          </tr>
                        ))}
                        {topBuildings.length === 0 && (
                          <tr>
                            <td colSpan={2} className="py-3 text-sm text-gray-500 text-center">
                              No data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Active Users */}
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Active Users</h3>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {activeUsers}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      Active users this period
                    </div>
                    
                    <div className="mt-6 w-full">
                      <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Top Users</h4>
                      <table className="min-w-full">
                        <tbody className="divide-y divide-gray-200">
                          {topUsers.map((user, index) => (
                            <tr key={index}>
                              <td className="py-3 text-sm font-medium text-gray-900">
                                {user.user_name}
                              </td>
                              <td className="py-3 text-sm text-gray-500 text-right">
                                {user.bookings} bookings
                              </td>
                            </tr>
                          ))}
                          {topUsers.length === 0 && (
                            <tr>
                              <td colSpan={2} className="py-3 text-sm text-gray-500 text-center">
                                No data available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;