import { useEffect, useState } from "react";
import Navbar from "./navbar";
import axios from "axios";

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

const Analytics = () => {
  // State for data
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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
  }, [bookings, rooms, users, dateRange]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all necessary data
      const [bookingsRes, usersRes, roomsRes] = await Promise.all([
        axios.get('http://localhost:3000/booking'),
        axios.get('http://localhost:3000/users'),
        axios.get('http://localhost:3000/rooms')
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
    const daysToInclude = dateRange === "7 days" ? 7 : 
                         dateRange === "30 days" ? 30 : 
                         dateRange === "12 months" ? 365 : 1;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToInclude);
    
    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.start_time);
      return bookingDate >= cutoffDate;
    });
    
    const previousPeriodCutoff = new Date(cutoffDate);
    previousPeriodCutoff.setDate(previousPeriodCutoff.getDate() - daysToInclude);
    
    const previousPeriodBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.start_time);
      return bookingDate >= previousPeriodCutoff && bookingDate < cutoffDate;
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
    const totalAvailableHours = totalRooms * daysToInclude * availableHoursPerDay;
    const utilizationPercent = (totalHours / totalAvailableHours) * 100;
    
    const previousTotalAvailableHours = totalRooms * daysToInclude * availableHoursPerDay;
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
        value: `${totalRooms}`,
        percentChange: 0, // Room count likely doesn't change period to period
        label: "Total Rooms"
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
                  <p className="text-gray-600 text-sm">Booking activity of last {dateRange}</p>
                </div>
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setDateRange("12 months")}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md  ${
                      dateRange === "12 months"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } border border-gray-300`}
                  >
                    12 months
                  </button>
                  <button
                    onClick={() => setDateRange("30 days")}
                    className={`px-4 py-2 text-sm font-medium ${
                      dateRange === "30 days"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } border-t border-b border-gray-300`}
                  >
                    30 days
                  </button>
                  <button
                    onClick={() => setDateRange("7 days")}
                    className={`px-4 py-2 text-sm font-medium ${
                      dateRange === "7 days"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } border-t border-b border-gray-300`}
                  >
                    7 days
                  </button>
                  <button
                    onClick={() => setDateRange("24 hours")}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                      dateRange === "24 hours"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    } border border-gray-300`}
                  >
                    24 hours
                  </button>
                </div>
              </div>
              
              {/* Booking Chart */}
              <div className="bg-white rounded-lg p-4 mb-8">
                <div className="h-80">
                  {dailyBookings.length > 0 ? (
                    <div className="flex items-end h-64 space-x-2 overflow-x-auto pb-2 px-4">
                      {dailyBookings.map((item, index) => {
                        const maxValue = getMaxValue();
                        const heightPercentage = maxValue > 0 ? (item.count / maxValue) * 100 : 0;
                        
                        return (
                          <div key={index} className="flex flex-col items-center flex-shrink-0">
                            <div 
                              className="w-10 bg-blue-500 rounded-t hover:bg-blue-600 transition-all"
                              style={{ height: `${heightPercentage}%`, minHeight: '4px' }}
                            >
                              <div className="h-full w-full flex items-center justify-center">
                                {item.count > 0 && (
                                  <span className="text-xs text-white font-medium">
                                    {item.count}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs mt-1 font-medium text-gray-500 w-10 text-center">
                              {item.day}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No data available for the selected date range
                    </div>
                  )}
                </div>
              </div>
              
              {/* Top Analytics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Top Rooms */}
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Top Rooms</h3>
                    <button className="text-gray-400 hover:text-gray-500">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
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
                    <button className="text-gray-400 hover:text-gray-500">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
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
                    <button className="text-gray-400 hover:text-gray-500">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
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