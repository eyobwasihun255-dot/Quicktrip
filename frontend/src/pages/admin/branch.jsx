import { useParams } from "react-router-dom";
import api from "../../api";
import { useEffect, useState } from "react";
import Topbar from "../../component/topbar";
function Branch() {

  useEffect(()=>{
    getBranchdetail()
    getStaff()

  },[])
  const { bid } = useParams();
  const [branch, setBranch] = useState([]);
  const [staff, setStaff] = useState([]);
  const getBranchdetail = () => {
    api
      .get(`api/branchdetail/${bid}`)
      .then((res) => res.data)
      .then((data) => {
        setBranch(data);
        console.log(data);
      })
      .catch((err) => alert(err));
  };
  
  const getStaff = () => {
    api
      .get(`api/stafflist/${bid}`)
      .then((res) => res.data)
      .then((data) => {
        setStaff(data);
        console.log(data);
      })
      .catch((err) => alert(err));
  };
  const deleteStaff = (uid) => {
    api
      .delete(`api/staffdetail/${uid}`)
      .then((res) => res.data)
      .then((data) => {
        console.log(data);
        window.location.reload();
      })
      .catch((err) => alert(err));
  };
  const deleteBranch = (bid) => {
    api
      .delete(`api/branchdetail/${bid}`)
      .then((res) => res.data)
      .then((data) => {
        console.log(data);
        window.location.href = '/ad_dashboard';
      })
      .catch((err) => alert(err));
  };
  return <>
   <Topbar/>
   <div className="branch_detail">
     <h1>{branch.name}</h1>
     <h2>{branch.address}</h2>
     <button onClick={() => deleteBranch(branch.id)}>Delete Branch</button>
   
   </div>
   <a href={`/add/${branch.id}`}>Add Staff</a>
   <div class="table-container">
          <table id="interactiveTable">
            <thead>
              <tr>
                <th onclick="sortTable(0)"> name</th>
                <th onclick="sortTable(1)"> phone number</th>
                <th onclick="sortTable(2)"> Position </th>
                <th onclick="sortTable(2)"> entry Date</th>
                <th onclick="sortTable(2)"> Actions</th>
              </tr>
            </thead>
            <tbody id="analysis">
              {staff.map((staffs, index) => (
                <tr>
                  <td>{staffs.employee.Fname} {staffs.employee.Lname}</td>
                  <td>{staffs.phone_number}</td>
                  <td>{staffs.employee.position}</td>
                  <td>{staffs.date_joined}</td>
                  <td><button onClick={() => deleteStaff(staffs.id)}>delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  </>;
}
export default Branch;
