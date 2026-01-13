import axios from 'axios'
import { ACCESS_TOKEN } from './constants'

// Ensure baseURL ends with a trailing slash
const rawBase = import.meta.env.VITE_API_URL || 'https://quicktrip-e761.onrender.com'
const baseURL = rawBase.endsWith('/') ? rawBase : `${rawBase}/`

const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if(token){
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error)=>{
        console.log(error)
    } 
)

export default api 