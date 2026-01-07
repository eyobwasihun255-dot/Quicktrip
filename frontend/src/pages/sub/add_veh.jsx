import Sub_top from './sub_top';
import { useState, useEffect,  } from "react";
import { useParams } from "react-router-dom"
import api from "../../api";
import { BRANCH } from '../../constants';

function Add_veh(){
    const [driver , setDriver]= useState([])
    const [user , setUser] = useState("")
    const [name, setName] = useState("")
    const [plate_number, setPlate_number] = useState("")
    const [color, setColor] = useState("#ff0000")
    const [Model, setModel] = useState("")
    const [sit, setSit] = useState("")
    const [ type, setType] = useState([])
    const [route, setRoute] = useState("")
    const [ types, setTypes] = useState("")
    const [routes, setRoutes] = useState([])
    const branch = localStorage.getItem(BRANCH);

    const [preview, setPreview] = useState()
    const [pictures, setPicture] = useState();


    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setPicture(file); 
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };
    useEffect(()=>{
        getDriver()
        getType()
        getRoute()
    },[])
    const getDriver = () => {
        api
          .get('api/driver/')
          .then((res) => res.data)
          .then((data) => {
            setDriver(data);
            console.log(data);
          })
          .catch((err) => alert(err));
      };
     
      const getType = () => {
        api
          .get('api/level/')
          .then((res) => res.data)
          .then((data) => {
            setType(data);
            console.log(data);
          })
          .catch((err) => alert(err));
      };
      const getRoute = async () => {
        try {
          const res = await api.get(`api/sub_route/${branch}`);
          setRoutes(res.data);
        } catch (err) {
          console.error("Failed to fetch routes:", err);
          setRoutes([]);
        }
      };



      const addVehicle = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('picture', pictures); // The actual file (not base64)
        formData.append('branch', branch);
        formData.append('name', name);
        formData.append('plate_number', plate_number);
        formData.append('year', plate_number);
        formData.append('color', color);
        formData.append('Model', Model);
        formData.append('sit', sit);
        formData.append('user', user);
        formData.append('types', types);
        formData.append('insurance_doc', plate_number);
        formData.append('insurance_date', plate_number);
        formData.append('location', '1'); // Ensure this matches backend expectations
        formData.append('route', route);
      
        try {
          const res = await api.post(`api/vehicle/${branch}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data', // Let the browser set this automatically
            },
          });
          if (res.status === 201) {
            window.location.reload();
          }
        } catch (error) {
          alert(error);
        }
      };
    return<>
    <Sub_top/>
    <form className="addform" onSubmit={addVehicle}>
    <input
            type="text"
            name="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
     <input
            type="text"
            name="Plate_number"
            placeholder="Plate Number"
            value={plate_number}
            onChange={(e) => setPlate_number(e.target.value)}
            required
          />
      
           <input 
        type="color" 
        name="color"
       
        placeholder="Color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        required
         />
           <input
            type="text"
            name="Model"
            placeholder="Model"
            value={Model}
            onChange={(e) => setModel(e.target.value)}
            required
          />
            <input
            type="number"
            name="Sit number"
            placeholder="Sit Number"
            value={sit}
            onChange={(e) => setSit(e.target.value)}
            required
          />
            <input type="file" onChange={handleImageChange} accept="image/*" />
            {pictures&& <img src={preview} alt="Preview" style={{maxWidth: '200px'}} />}
        <select 
        id="options" 
        value={types} 
        onChange={(e) => setTypes(e.target.value)}
        required
      >
            {type.map((tys, index) => (
              <option
                value={tys.id}
               >
               {tys.level}
              </option>
            ))}
    </select>
     <select 
        id="options" 
        value={user} 
        onChange={(e) => setUser(e.target.value)}
        required
      >
            {driver.map((drivers, index) => (
              <option
                value={drivers.id}
               >
               {`${drivers.employee.Fname} ${drivers.employee.Lname}`}
              </option>
            ))}
    </select>
    <select 
        id="options" 
        value={route} 
        onChange={(e) => setRoute(e.target.value)}
        required
      >
            {routes.map((rout, index) => (
              <option
                value={rout.id}
               >
               {rout.name}
              </option>
            ))}
    </select>
    <a href=""> Add Driver</a>
    <button type='submit'>Add Vehicle</button>
    </form>
    
    </>

}
export default Add_veh;