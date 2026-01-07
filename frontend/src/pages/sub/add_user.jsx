import Sub_top from "./sub_top";
import { useState, useEffect } from "react";
import api from "../../api";
function Adduser(){
     const [searchterm, setSearchTerm] = useState("")
     const [user , setUser] = useState([])

     const getUser = () => {
        
        api
          .get(`api/nid/${searchterm}`)
          .then((res) => res.data)
          .then((data) => {
            setUser(data)
            console.log(data);
          })
          .catch((err) => alert(err));
      };
      const addUser = async (e) => {
    
        e.preventDefault();
    
        try {
          const res = await api.post(`api/addtraveller/`, {
            user_type : "u",
            phone_number : user[0].phone_number,
            branch : 6 ,
            nid : user[0].id,

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

    <a href ="/nonfayda/">without Fayda</a>
    <div className="search-preview">
        <input
          type="text"
          value={searchterm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for existing records"
        />
        <button onClick={getUser}>Search</button>
        
        {user.length > 0 && (
          <div className="search-results">
            {user.map(item => (
              <div 
                key={item.id} 
                className="search-result-item"
                onClick={() => setUser(item)}
              >
                {item.Fname} {item.Lname} {item.phone_number}
                <button onClick={addUser}>register</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
}
export default Adduser;