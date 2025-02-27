import { useState } from "react";
import { Link, useNavigate} from "react-router-dom";
import Navbar from "./navbar";

const Dashboard = () => {
    return (
        <div className="flex flex-col w-full min-h-screen">
            <div className="flex justify-end">
                <Navbar />
            </div>
            
            <div className="flex-1 flex justify-center items-center">
                <h1>Dashboard</h1>
            </div>
        </div>
    )
}

export default Dashboard;