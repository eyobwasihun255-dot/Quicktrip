import Topbar from "../../component/topbar"
import { useState, useEffect } from "react"
import api from "../../api"

function Addroute(){
    
    const [name, setName] = useState("")
    const [prize, setPrize] = useState("")
    const [first_destination, setFirst_destination] = useState("")
    const [last_destination, setLast_destination]= useState("")
    const [branch, setBranch] =  useState([])
    useEffect(()=>{
     getBranch()
    },[])
    const handleChange = (event) => {
        setLast_destination(event.target.value);
      };
    const handleChanges = (event) => {
       setFirst_destination(event.target.value);
      };
    const getBranch = () => {
     api
       .get('api/branch/')
       .then((res) => res.data)
       .then((data) => {
         setBranch(data);
         console.log(data);
       })
       .catch((err) => alert(err));
   };
      const addRoute= async (e) => {
    
        e.preventDefault();
    
        try {
          const res = await api.post(`api/route/`, {
            name,
            first_destination,
            last_destination,
            prize,
          });
          if (res.status === 201) {
            window.location.href = `/transportation`;
          }
        } catch (error) {
          alert(error);
        } finally {
        }
      };
return <>
<Topbar/>
<form onSubmit={addRoute}>
    <input
            type="text"
            name="name"
            placeholder="Route Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
    <input
            type="text"
            name="Prize"
            placeholder="Prize"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            required
          />
    <select 
        id="options" 
        value={first_destination} 
        onChange={handleChanges}
        required
      >
            {branch.map((branchs, index) => (
              <option
                value={branchs.id}
               >
                {branchs.name}
              </option>
            ))}
    </select>
    <select 
        id="option" 
        value={last_destination} 
        onChange={handleChange}
        required
      >
            {branch.map((branchs, index) => (
              <option
                value={branchs.id}
               
              >
                {branchs.name}
              </option>
            ))}
    </select>
    <button type="submit">Add Branch</button>
    </form>

</>
}
export default Addroute;