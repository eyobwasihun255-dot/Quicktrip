import Sub_top from './sub_top';
import { useState, useEffect } from "react";
import api from "../../api";
import { BRANCH, USER_ID } from '../../constants';

function Sub_home() {
  const [route, setRoute] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const branch = localStorage.getItem(BRANCH);
  const id = localStorage.getItem(USER_ID);
  const hour = new Date().getHours();

  useEffect(() => {
    if (!branch || !id) {
      console.error("Missing branch or user ID");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        await Promise.all([getUser(), getRoute()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [branch, id]);

  const getRoute = async () => {
    try {
      const res = await api.get(`api/sub_route/${branch}`);
      setRoute(res.data);
    } catch (err) {
      console.error("Failed to fetch routes:", err);
      setRoute([]);
    }
  };

  const getUser = async () => {
    try {
      const res = await api.get(`api/staffdetail/${id}`);
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    }
  };

  if (loading) return <div>Loading...</div>;

  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <Sub_top />
      <div className="greeting">
        <h2>
          {greeting},{' '}
          {user?.employee 
            ? `${user.employee.Fname} ${user.employee.Lname}`
            : 'User'
          }!
        </h2>
      </div>

      <div className="table-container">
        <table id="interactiveTable">
          <thead>
            <tr>
              <th onClick={() => sortTable(0)}>Route name</th>
              <th onClick={() => sortTable(1)}>First Destination</th>
              <th onClick={() => sortTable(2)}>Last Destination</th>
              <th onClick={() => sortTable(3)}>action</th>
            </tr>
          </thead>
          <tbody id="analysis">
            {route.map((routes, index) => (
              <tr key={index}>
                <td>{routes.name}</td>
                <td>{routes.first_destination}</td>
                <td>{routes.last_destination}</td>
                <td><a href={`/route/${routes.id}`}>view</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Sub_home;