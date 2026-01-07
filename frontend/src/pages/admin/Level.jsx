import Topbar from "../../component/topbar"
import { useState, useEffect } from "react"
import api from "../../api"
function Level(){
     const [level, setLevel] =  useState([])
     useEffect(()=>{
        getLevel()
     },[])
     const getLevel = () => {
        api
          .get(`api/level/`)
          .then((res) => res.data)
          .then((data) => {
            setLevel(data);
            console.log(data);
          })
          .catch((err) => alert(err));
      };
    return <>
    <Topbar/>
    <div class="table-container">
          <table id="interactiveTable">
            <thead>
              <tr>
                <th onclick="sortTable(0)"> Name</th>
                <th onclick="sortTable(1)"> Orgin</th>

                <th onclick="sortTable(2)"> %</th>
                <th onclick="sortTable(2)"> Actions</th>
              </tr>
            </thead>
            <tbody id="analysis">
              {level.map((levels, index) => (
                <tr>
                  <td>{levels.level}</td>
                  <td>{levels.detail}</td>
                  <td>{levels.prize}</td>
                  <td><button onClick={() => deleteStaff(staffs.id)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
   
    
    </>
}
export default Level;