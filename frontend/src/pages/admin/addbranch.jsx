import Topbar from "../../component/topbar"
import { useState, useEffect } from "react"
import api from "../../api"

function Addbranch(){

    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [selectedOption, setSelectedOption] = useState('')
    const handleChange = (event) => {
        setSelectedOption(event.target.value);
      };
    const addbranch = async (e) => {
        e.preventDefault();
        try {
          const res = await api.post(`api/branch/`, {
            name,
            address ,
            type: selectedOption,
          });
          if (res.status === 201) {
            window.location.href = `/ad_dashboard`;
          }
        } catch (error) {
          alert(error);
        } finally {
        }
      };
    return<>
    <Topbar/>
    <form onSubmit={addbranch}>
    <input
            type="text"
            name="name"
            placeholder="Branch Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
    <input
            type="text"
            name="address"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
    <select 
        id="options" 
        value={selectedOption} 
        onChange={handleChange}
      >
        <option value="">-- Select --</option>
        <option value="b">Branch</option>
        <option value="m">Main</option>
       
      </select>
    <button type="submit">Add Branch</button>
    </form>
    </>
}
export default Addbranch;