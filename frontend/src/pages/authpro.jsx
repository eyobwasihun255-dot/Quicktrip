

import {Navigate, redirectDocument} from 'react-router-dom'
import { USER_ROLE } from '../constants'


const Authpro = ({ children }) => {
  const userRole = localStorage.getItem(USER_ROLE);
 
  if (userRole && (userRole == "s" || userRole == "a")) {
    return children;
  }
  return <Navigate to="/unauthorized" replace />; 
  
}

export default Authpro;