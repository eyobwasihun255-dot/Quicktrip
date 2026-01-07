import Sub_top from "./sub_top";
import api from "../../api";
import { useState } from "react";

function Non_fayda(){

     const [preview, setPreview] = useState()
     const [pictures, setPicture] = useState();
     const [selectedOption, setSelectedOption] = useState('')
     const [Fname, setFname] = useState('')
     const [Lname, setLname] = useState('')

     const [did, setDid] = useState('')
     const [user, setUser] = useState({user_type:"u",phone_number:"11   ",branch:"6",nid:"0"})
     const handleChange = (event) => {
           setSelectedOption(event.target.value);
         };
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

      const addUser = async (e) => {
    
        e.preventDefault();
        const formData = new FormData();
        formData.append('doc', pictures); 
        formData.append('first_name', Fname);
        formData.append('last_name', Lname);
        formData.append('type', selectedOption);
        formData.append('did', did);
        formData.append('user',user);
        
    
        try {
          const res = await api.post(`api/othercred/`,
            {  first_name:Fname,
               last_name :Lname,
               did : did,
               type :selectedOption,
               user :user,
               doc :pictures,

             }
            
            , {
            headers: {
              'Content-Type': 'multipart/form-data', 
            },
          });
          if (res.status === 201) {
            window.location.reload;
          }
        } catch (error) {
          alert(error);
        } finally {
        }
      };
    return <>
    <Sub_top/>
    <form className="addform"onSubmit={addUser}>
    <input
            type="text"
            name="fname"
            placeholder="First Name"
            value={Fname}
            onChange={(e) => setFname(e.target.value)}
            required
          />
    <input 
            type="text"
            name="lname"
            placeholder="Last Name"
            value={Lname}
            onChange={(e) => setLname(e.target.value)}
            required
          />
    <input
            type="text"
            name="Doc id"
            placeholder="Document Id"
            value={did}
            onChange={(e) => setDid(e.target.value)}
            required
          />
         <input
            type="text"
            name="phone_number"
            placeholder="phone number"
            value={user.phone_number}
            onChange={(e) => setUser(prevUser => ({...prevUser,phone_number: e.target.value }))}
            required
          />
            <input type="file" onChange={handleImageChange} accept="image/*" />
            {pictures&& <img src={preview} alt="Preview" style={{maxWidth: '200px'}} />}
          <select 
        id="options" 
        value={selectedOption} 
        onChange={handleChange}
        required
      >
        <option value="">-- Select --</option>
        <option value="d">Driving License</option>
        <option value="p">Passport</option>
        <option value="i">Institute Id</option>
        <option value="g">Government Id</option>
        <option value="o">Other</option>
       
      </select>
         
         
          <button type="submit">Add User</button>
    </form>
    </>
}
export default Non_fayda;