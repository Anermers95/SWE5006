import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "./navbar";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

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

const RoomList = () => {
    const navigate = useNavigate(); // Use navigate hook

    const [user, setUser] = useState<any>({});
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>("");
    const [filterCapacity, setFilterCapacity] = useState<number | "">("");
    const [filterBuilding, setFilterBuilding] = useState<string>("");
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

    // Sample image for rooms that don't have one
    const defaultRoomImage = "https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80";

    useEffect(() => {

        const storedUser = sessionStorage.getItem("user");

        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUser(user);
        } else {
            // Redirect to login if needed
            window.location.href = "/login";
            return;
        }
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const response = await axios.get(`${API_URL}/rooms`);
            setRooms(response.data);
            setLoading(false);
        } catch (error) {
            console.log("Error fetching rooms:", error);
            setError("Failed to fetch rooms");
            setRooms([]);
        } finally {
            setLoading(false);
        };
    };

    // Handle viewing room details
    const handleViewDetails = (roomId: number) => {
        console.log(`Navigate to update page for room ${roomId}`);
        navigate(`/room/update/${roomId}`);
    };

  // Handle delete room
  const handleDelete = async (roomId: number) => {

    const getRoomWithBookings =  await axios.get(`${API_URL}/booking/room/${roomId}/`);

    if (getRoomWithBookings.data.length > 0) {
      alert("Cannot delete room with bookings. Please delete the bookings first.");
      return;
    }
    

    const confirmDelete = window.confirm("Are you sure you want to delete this room?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/rooms/${roomId}`);
      alert("Room deleted successfully!");
      window.location.href = `/room`;
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

    // Filter rooms based on criteria - only showing active rooms
    const filteredRooms = rooms.filter(room => {
        if (filterType && room.room_type !== filterType) return false;
        if (filterCapacity && room.room_seating_capacity < Number(filterCapacity)) return false;
        if (filterBuilding && room.building_name !== filterBuilding) return false;
        return room;
    });

    // Get unique values for filters
    const uniqueTypes = Array.from(new Set(rooms.map(room => room.room_type)));
    const uniqueBuildings = Array.from(new Set(rooms.map(room => room.building_name)));

    const navigateCreateRoom = async () => {
        navigate("/room/create");
    }


    return (
        <div className="flex flex-col w-full min-h-screen">
            {/* Top Navigation */}
            <div className="flex justify-end">
                <Navbar />
            </div>

            {/* Main content container with white background and rounded corners */}
            <div className="container mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="mb-8">
                        {/* Page Header */}
                        <h1 className="text-3xl font-semibold text-gray-800">Room Management</h1>
                        <p className="text-gray-600 mt-2">Manage rooms across campus</p>

                        {/* Notification */}

                    </div>
                    {/* Filters Section */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <h2 className="font-medium text-lg mb-4 text-gray-900">Filters</h2>

                        {/* Room Properties Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

                            {/* Room Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-1">Room Type</label>
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
                            <div className="grid xl:grid-cols-2 gap-100 relative">
                                <p className="mb-4 text-gray-600">Showing {filteredRooms.length} out of {rooms.length} rooms</p>
                                <button
                                    onClick={navigateCreateRoom}
                                    className="flex-1 bg-blue-500 hover:bg-blue-400 text-white font-medium py-2 px-4 rounded transition duration-150 rounded-half"
                                >
                                    Add Room
                                </button>
                            </div>

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
                                                        onClick={() => handleViewDetails(room.room_id)}
                                                        className="flex-1 bg-blue-500 text-white font-medium py-2 px-4 rounded transition duration-150 rounded-half"
                                                    >
                                                        Update Room
                                                    </button>
                                                    <button  className="flex-1 bg-red-500 text-white font-medium py-2 px-4 rounded transition duration-150 rounded-half"
                                                    onClick={() => handleDelete(room.room_id)}>Delete</button>

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

        </div>
    );
};

export default RoomList;