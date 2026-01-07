import Topbar from "../../component/topbar"
import { useState, useEffect } from "react"
import api from "../../api"
function Transportation(){
     const [route, setRoute] =  useState([])
     useEffect(()=>{
        getRoute()
     },[])
     const getRoute = () => {
        api
          .get(`api/route/`)
          .then((res) => res.data)
          .then((data) => {
            setRoute(data);
            console.log(data);
          })
          .catch((err) => alert(err));
      };
    return <>
    <Topbar/>
    <a href="/addroute">Add Route</a>
    <div className="routes">
    <a href="/level">Levels</a>
   
    <div class="table-container">
          <table id="interactiveTable">
            <thead>
              <tr>
                <th onclick="sortTable(0)"> Name</th>
                <th onclick="sortTable(1)"> Orgin</th>
                <th onclick="sortTable(2)"> Destination</th>
                <th onclick="sortTable(2)"> Prize</th>
                <th onclick="sortTable(2)"> Actions</th>
              </tr>
            </thead>
            <tbody id="analysis">
              {route.map((routes, index) => (
                <tr>
                  <td>{routes.name}</td>
                  <td>{routes.first_destination}</td>
                  <td>{routes.last_destination}</td>
                  <td>{routes.prize}</td>
                  <td><button onClick={() => deleteStaff(staffs.id)}>delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </div>
    
    </>
}
export default Transportation