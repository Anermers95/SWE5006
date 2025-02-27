import { useEffect, useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import Navbar from "./navbar";

const Dashboard = () => {
    const [userRole,setUserRole] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserRole(user.role_id);  
        } else {
          window.location.href = "/login";
        }
      }, []);

    return (
        <div className="flex flex-col w-full min-h-screen">
            <div className="flex justify-end">
                <Navbar />
            </div>
            
            <div className="flex-1 flex justify-center items-center">
                <h1>{userRole === 1 ? "Admin Dashboard" : "User Dashboard"}</h1>
            </div>
        </div>
    )
}

export default Dashboard;