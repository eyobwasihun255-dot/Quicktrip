import {Navigate, redirectDocument} from 'react-router-dom'
import { USER_ROLE } from '../constants'


const Protected = ({children , allowedRoles})=>{
    const role = localStorage.getItem(USER_ROLE);
   
    if (!role || !allowedRoles.includes(role)){
        return <Navigate to="/unauthorized" replace/>;
    }
   
    return children
}
export default Protected