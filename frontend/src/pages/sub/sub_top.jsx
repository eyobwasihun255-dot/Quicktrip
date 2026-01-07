import { useParams } from "react-router-dom";
import api from "../../api";
import { useEffect, useState } from "react";
import Topbar from "../../component/topbar";


function Sub_top(){
    return <div className="topbar">
 <ul>
     <li><a href ="/sub_dashboard">Home</a></li>
     <li><a href ="/add_vehicle"> Add Vehicle</a></li>
     <li><a href ="/buyticket">buy ticket</a></li>
     <li><a href ="/sub_alert">Alert and Tracking</a></li>
     <li><a href ="/logout">Logout</a></li>
 </ul>
</div>
}
export default Sub_top;