import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./navbar";
import axios from "axios";

const RoomForm = () => {
  const navigate = useNavigate(); // Use navigate hook

  const { id } = useParams(); // Get the id from the URL (if updating)

  const [formData, setFormData] = useState({
    roomName: "",
    capacity: "",
    room_type: "",
    buildingName: "",
    is_active: false,
  });
  const [loading, setLoading] = useState(true);


  // Fetch room details if updating
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:3000/rooms/${id}`)
        .then((response) => {
          setFormData({
            roomName: response.data.room_name,
            capacity: response.data.room_seating_capacity,
            room_type: response.data.room_type,
            buildingName: response.data.building_name,
            is_active: response.data.is_active,
          });
        })
        .catch((error) => console.error("Error fetching room details:", error))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? !prev[name as keyof typeof prev] : value, // Toggle checkbox
    }));
  };



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (id) {
        // Update Room
        await axios.put(`http://localhost:3000/rooms/${id}`, formData);
        alert("Room updated successfully!");
        navigate("/room");
      } else {
        // Create Room
        const retriveResponse = await axios.get("http://localhost:3000/rooms");
        console.log(retriveResponse.data.name);

        for (let i = 0; i < retriveResponse.data.length; i++) {
          if (retriveResponse.data[i].room_name === formData.roomName && retriveResponse.data[i].building_name === formData.buildingName) {
            alert("Room Name already exist within this building!");
            return;
          }
        }

        const response = await axios.post("http://localhost:3000/rooms", formData);
        console.log(response.data);
        alert("Room Created Successful!");
        navigate("/room");
      }
    } catch (error) {
      console.log(error);
    }

  };

  if (loading) return <p>Loading room details...</p>;

  return (

    <div className="max-w-2xl mx-auto">
      <div className="relative z-0 mb-6 w-full group">
        <h1 className="text-2xl font-semibold tracking-wider text-gray-800 capitalize dark:text-white">
          {/* Switch between Update Room and Create Room header*/}
          {id ? "Update Room" : "Create Room"}

        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="roomName"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=""
            value={formData.roomName}
            onChange={handleChange}
            required />

          <label htmlFor="roomName" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Room Name</label>
        </div>
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="capacity"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            value={formData.capacity}
            onChange={handleChange}
            placeholder=""
            required />

          <label htmlFor="capacity" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Capacity</label>
        </div>
        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="room_type"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            value={formData.room_type}
            onChange={handleChange}
            placeholder=""
            required />
          <label htmlFor="room_type" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Room Type</label>
        </div>

        <div className="relative z-0 mb-6 w-full group">
          <input
            type="text"
            name="buildingName"
            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            value={formData.buildingName}
            onChange={handleChange}
            placeholder=""
            required />
          <label htmlFor="buildingName" className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Building Name</label>
        </div>

        <div className="flex items-center items-start mb-4">
          <input
            id="heckbox-1"
            aria-describedby="checkbox-1"
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="bg-gray-50 border-gray-300 focus:ring-3 focus:ring-blue-300 h-4 w-4 rounded"
          />


          <label htmlFor="checkbox-1" className="text-sm ml-3 font-medium text-gray-900">Is Active</label>
        </div>
        <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
          {id ? "Update Room" : "Create Room"}
        </button>
      </form>

      <p className="mt-5">Check out the original floating label form elements on <a className="text-blue-600 hover:underline"
        href="#" target="_blank">Flowbite</a> and browse other similar components built with Tailwind CSS.
      </p>
    </div>

  );
};

export default RoomForm;
