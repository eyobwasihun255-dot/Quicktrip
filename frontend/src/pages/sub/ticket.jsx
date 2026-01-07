import api from "../../api";
import Sub_top from "./sub_top";
import { useState , useEffect } from "react";
import { BRANCH } from '../../constants';

function  Buyticket(){
    const [date, setDate] = useState("")
    const [searchterm, setSearchTerm] = useState("")
    const [time, setTime] = useState("")
    const [total_prize, setTotal_prize] = useState("")
    const [phone_number, setPhone_number] = useState("")
    const [quantity, setQuantity] = useState("")
    const [routes , setRoutes] = useState([])
    const [route , setRoute] = useState([])
    const [user , setUser] = useState([])
    const [type , setType] = useState([])
    const [types , setTypes] = useState([])

    const branch = localStorage.getItem(BRANCH);
    

    useEffect(()=>{
      getRoute();
      getType();
    },[])
    const getRoute = async () => {
        try {
          const res = await api.get(`api/sub_route/${branch}`);
          setRoutes(res.data);
        } catch (err) {
          console.error("Failed to fetch routes:", err);
          setRoutes([]);
        }
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
      const getUser = () => {
        
        api
          .get(`api/getUser/${searchterm}`)
          .then((res) => res.data)
          .then((data) => {
            setPhone_number(searchterm);
            setUser(data)
            
            console.log(data);
          })
          .catch((err) => alert(err));
      };
      const calculate = () => {
        if (!route || !types) {
          alert("Please select both route and ticket type first");
          return;
        }
    
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty <= 0) {
          alert("Please enter a valid quantity");
          return;
        }
    
        const selectedRoute = routes.find(r => r.id === parseInt(route));
        const selectedType = type.find(t => t.id === parseInt(types));
    
        if (!selectedRoute || !selectedType) {
          alert("Invalid selection");
          return;
        }
    
        const total = selectedRoute.route_prize * selectedType.prize * qty;
        setTotal_prize(total);
      };
      const buyticket = async (e) => {
        e.preventDefault();
        
        try {
          const res = await api.post(`api/buyticket/${branch}`,
            {
              route :parseInt(route),
              level : parseInt(types),
              quantity : parseInt(quantity),              
              takeoff_date : date,
              takeoff_time : time,
              total_prize : total_prize,
              user :  user[0].id, 

              
          });
          if (res.status === 201) {
            window.location.reload();
          }
        } catch (error) {
          alert(error);
        }
      };

    return <>
    <Sub_top/>
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
                onClick={() => setUser(item.id)}
              >
                {item.phone_number} ({item.id})
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="ticket-selection">
        <input
          type="number"
          name="Quantity"
          placeholder="Quantity"
          value={quantity}
          min="1"
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        
        <select 
          value={types} 
          onChange={(e) => setTypes(e.target.value)}
          required
        >
          <option value="">Select ticket type</option>
          {type.map((tys) => (
            <option key={tys.id} value={tys.id}>
              {tys.level} (%{tys.prize})
            </option>
          ))}
        </select>
        
        <select 
          value={route} 
          onChange={(e) => setRoute(e.target.value)}
          required
        >
          <option value="">Select route</option>
          {routes.map((rout) => (
            <option key={rout.id} value={rout.id}>
              {rout.name} (${rout.route_prize})
            </option>
          ))}
        </select>
        
        <button onClick={calculate}>Check Price</button>
        
        {total_prize > 0 && (
          <div className="price-display">
            <h3>Total Price: ${total_prize}</h3>
           
          </div>
        )}
      
   
  
    
         
    </div>
    <form>
    <input
            type="time"
            name="time"
            placeholder="Time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        <input
            type="date"
            name="date"
            placeholder="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
           <button onClick={buyticket}>Confirm Purchase</button>
  
        
         
          </form>
        
          
    
    
    <a href ="/adduser/">Add user </a>
    <label>Long distance ?</label>
    <a href ="/long_route/">Long Distance ticket</a>
    </>
}
export default Buyticket;