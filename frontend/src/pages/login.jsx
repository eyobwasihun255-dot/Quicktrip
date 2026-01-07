import '../pages/style.css'

import { useState } from "react";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN, USER_ROLE ,USER_ID, BRANCH } from "../constants";

function Login() {
    const [phone_number, setPhonenumber] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState({ type: "", text: "" })


    const handleSubmit = async (e) =>{
      setLoading(true);
      e.preventDefault();

        try {
          const normalizedPhone = String(phone_number).trim();
          const res = await api.post('/api/token',{ phone_number: normalizedPhone, password})
           
          // lightweight JWT payload decoder (browser-safe, no external lib)
          const decodeJwt = (token) => {
            try {
              const payload = token.split('.')[1];
              const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
              return JSON.parse(decodeURIComponent(escape(decoded)));
            } catch {
              return {};
            }
          };

          const decoded = decodeJwt(res.data.access);
          const role = decoded.role;
          const id = decoded.user_id;
          const branch = decoded.branch;
          localStorage.setItem(USER_ROLE,role)
          localStorage.setItem(USER_ID,id)
          localStorage.setItem(BRANCH,branch)
          localStorage.setItem(ACCESS_TOKEN, res.data.access);
          localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
          console.log(role)
          window.location.href = '/home';
          

      }
      catch (error) {
        console.error(error);
        setMessage({ 
          type: 'error',
          text: "Wrong credentials",
         
        });
      }
      finally{
          setLoading(false)
      }
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-overlay"></div>

      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">QuickTrip</h1>
          <p className="login-subtitle"> Dashboard</p>
        </div>

     
       
        <form onSubmit={handleSubmit}>
        {message.text && (
            <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
              {message.text}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Phone number
            </label>
            <div className="input-wrapper">
              <input
                type="tel"
                id="phonenumber"
                className="form-control"
                value={phone_number}
                onChange={(e) => setPhonenumber(e.target.value)}
                required
                placeholder="Phone number"
              />
              <span className="input-focus-effect"></span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <input
         
                className="form-control"
                id="password"
                
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
              <span className="input-focus-effect"></span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block login-btn" disabled={loading}>
            {loading ? "Logging in..." : `Login `}
          </button>
        </form>
       

        <div className="login-footer">
          <p>For Admin and subadmin users only</p>
          
        </div>
      </div>

  <style>{`
        .login-container {
          display: flex;
       
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80');
          background-size: cover;
          background-position: center;
          filter: blur(2px);
          z-index: -2;
        }

        .login-overlay {
        
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.6);
          z-index: -1;
        }
       .alert {
          padding: 10px 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .alert-success {
          background-color: #d4edda;
          color: #155724;
        }
        
        .alert-error {
          background-color: #f8d7da;
          color: #721c24;
        }
        .login-card {
          width: 100%;
          max-width: 450px;
          background-color: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          padding: 40px;
          backdrop-filter: blur(10px);
          transition: transform 0.3s, box-shadow 0.3s;
             color: black;
        }

        .login-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 5px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .login-subtitle {
          color: var(--text-light);
          font-size: 1.1rem;
        }

        .role-selector {
          margin-bottom: 25px;
        }

        .role-options {
          display: flex;
          gap: 20px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .role-option {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 10px 15px;
          border-radius: 8px;
          transition: background-color 0.2s;
        }

        .role-option:hover {
          background-color: rgba(58, 134, 255, 0.1);
        }

        .role-option input {
          margin-right: 8px;
          cursor: pointer;
          min-width: 18px;
          min-height: 18px;
          accent-color: var(--primary-color);
        }

        .role-name {
          font-weight: 500;
          font-size: 1.1rem;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          font-size: 1rem;
          color: grey;
        }

        .input-wrapper {
          position: relative;
        }

        .form-control {
          width: 100%;
          padding: 12px 15px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          font-size: 1rem;
          background-color: rgba(255, 255, 255, 0.9);
          color: var(--text-primary);
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s;
        }

        .form-control:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.2);
          transform: translateY(-2px);
        }

        .input-focus-effect {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background-color: var(--primary-color);
          transition: width 0.3s;
        }

        .form-control:focus + .input-focus-effect {
          width: 100%;
        }

        .text-right {
          text-align: right;
        }

        .forgot-password {
          color: var(--primary-color);
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.2s;
        }

        .forgot-password:hover {
          color: #2a75e8;
          text-decoration: underline;
        }

        .login-btn {
          padding: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--primary-color), #2a75e8);
          border: none;
          color: white;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background 0.3s;
          box-shadow: 0 4px 6px rgba(42, 117, 232, 0.2);
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(42, 117, 232, 0.3);
          background: linear-gradient(135deg, #2a75e8, var(--primary-color));
        }

        .login-btn:active {
          transform: translateY(0);
        }

        .login-footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
          font-size: 0.9rem;
          color: var(--text-light);
        }

        .login-footer p {
          margin-bottom: 5px;
        }

        @media (max-width: 576px) {
          .login-card {
            padding: 25px;
          }
          
          .login-title {
            font-size: 2rem;
          }
          
          .role-options {
            flex-direction: column;
            gap: 10px;
          }
          
          .form-control {
            padding: 10px 12px;
          }
          
          .login-btn {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  )
}
export default Login