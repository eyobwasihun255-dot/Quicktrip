import Sub_top from './sub_top';
import { useState, useEffect,  } from "react";
import { useParams } from "react-router-dom"
import api from "../../api";
import { BRANCH, USER_ID } from '../../constants';

function Sub_route(){
    const [travels, setTravels] =  useState([])
    const { rid } = useParams()
    useEffect(()=>{
        getTravels()
    },[])
    const getTravels = async () => {
        try {
          const res = await api.get(`api/sub_travels/${rid}`);
          setTravels(res.data);
        } catch (err) {
          console.error("Failed to fetch routes:", err);
          
        }
      };
    return <>
    <Sub_top />
    <div className="table-container">
        <table id="interactiveTable">
          <thead>
            <tr>
              <th onClick={() => sortTable(0)}>Branch name</th>
              <th onClick={() => sortTable(1)}>Address</th>
              <th onClick={() => sortTable(2)}>Type</th>
              <th onClick={() => sortTable(3)}>action</th>
            </tr>
          </thead>
          <tbody id="analysis">
            {travels.map((travel, index) => (
              <tr key={index}>
                <td>{travel.ticket.route.name}</td>
                <td>{travel.time}</td>
                <td>{travel.ticket.quantity}</td>
                <td><a href={`/route/${travel.id}`}>view</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
}
export default Sub_route;