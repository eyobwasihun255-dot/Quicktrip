import { useState, useEffect } from "react";
import api from "../api";

const VehicleEdit = ({ onClose, onSave, vehicle }) => {
  const [branchs, setBranchs] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [driver, setDriver] = useState([]);
  const [longBuses, setLongBuses] = useState([]); // <-- fetch long buses
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    route: null,
    branch: null,
    driver: null,
    isLongBus: false,  // <-- checkbox
    longBus: null,     // <-- selected long bus
  });

  useEffect(() => {
    getBranch();
    getDriver();
    getRoute();
    getLongBuses();
    if (vehicle) {
      setFormData({
        route: vehicle.route?.id || null,
        branch: vehicle.branch?.id || null,
        driver: vehicle.user?.id || null,
        isLongBus: vehicle.longbus ? true : false,
        longBus: vehicle.longbus?.id || null,
      });
    }
  }, [vehicle]);

  const getBranch = async () => {
    try {
      const res = await api.get("api/edit_branch/");
      setBranchs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getDriver = async () => {
    try {
      const res = await api.get("api/driver/");
      setDriver(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getRoute = async () => {
    try {
      const res = await api.get("api/route/");
      setRoutes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getLongBuses = async () => {
    try {
      const res = await api.get("api/long-buses/");
      setLongBuses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.route) newErrors.route = "Route is required";
    if (!formData.branch) newErrors.branch = "Branch is required";
    if (!formData.driver) newErrors.user = "Driver is required";
    if (formData.isLongBus && !formData.longBus)
      newErrors.longBus = "Long Bus selection required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  try {
    const res = await api.patch(`api/editVehicle/${vehicle.id}/`, {
      route: formData.route,
      branch: formData.branch,
      user: formData.driver,
      long: formData.isLongBus,             // <-- mark as long distance
      longbus: formData.isLongBus ? formData.longBus : null, // only if checkbox is ticked
    });

    if (res.status === 200) {
      setMessage({ type: "success", text: "Vehicle updated successfully!" });
      onSave();
    }
  } catch (error) {
    setMessage({
      type: "error",
      text: error.response?.data?.message || "An error occurred",
    });
  }
};


  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Edit {vehicle.plate_number}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {message.text && (
              <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}>
                {message.text}
              </div>
            )}
            {/* Long Distance Checkbox */}
<div className="form-group">
  <label>
    <input
      type="checkbox"
      checked={formData.isLongBus || vehicle.long} // ticked if vehicle.long is true
      onChange={(e) =>
        setFormData({ ...formData, isLongBus: e.target.checked })
      }
    /> Is Long Distance
  </label>
</div>


            {/* Existing fields */}
            <div className="form-group">
              <label className="form-label">Current vehicle</label>
              <input
                type="text"
                className="form-control"
                value={vehicle?.plate_number || ""}
                readOnly
              />
            </div>

            <h3 className="section-title">Station and Route</h3>

            {/* Route */}
            <div className="form-group">
              <label className="form-label">Route</label>
              <select
                className={`form-control ${errors.route ? "is-invalid" : ""}`}
                value={formData.route || ""}
                onChange={(e) =>
                  setFormData({ ...formData, route: parseInt(e.target.value) })
                }
              >
                <option value="">-- Select Route --</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {errors.route && <div className="error-message">{errors.route}</div>}
            </div>

            {/* Driver */}
            <div className="form-group">
              <label className="form-label">Driver</label>
              <select
                className={`form-control ${errors.user ? "is-invalid" : ""}`}
                value={formData.driver || ""}
                onChange={(e) =>
                  setFormData({ ...formData, driver: parseInt(e.target.value) })
                }
              >
                <option value="">-- Select Driver --</option>
                {driver.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.employee?.Fname} {d.employee?.Lname}
                  </option>
                ))}
              </select>
              {errors.user && <div className="error-message">{errors.user}</div>}
            </div>

            {/* Branch */}
            <div className="form-group">
              <label className="form-label">Branch</label>
              <select
                className={`form-control ${errors.branch ? "is-invalid" : ""}`}
                value={formData.branch || ""}
                onChange={(e) =>
                  setFormData({ ...formData, branch: parseInt(e.target.value) })
                }
              >
                <option value="">Select a branch</option>
                {branchs.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              {errors.branch && <div className="error-message">{errors.branch}</div>}
            </div>

            {/* Long Bus Checkbox */}
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isLongBus}
                  onChange={(e) =>
                    setFormData({ ...formData, isLongBus: e.target.checked, longBus: null })
                  }
                /> Use as Long Bus
              </label>
            </div>

            {/* Long Bus Dropdown (conditionally rendered) */}
            {formData.isLongBus && (
              <div className="form-group">
                <label className="form-label">Select Long Bus</label>
                <select
                  className={`form-control ${errors.longBus ? "is-invalid" : ""}`}
                  value={formData.longBus || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, longBus: parseInt(e.target.value) })
                  }
                >
                  <option value="">-- Select Long Bus --</option>
                  {longBuses.map(lb => (
                    <option key={lb.id} value={lb.id}>{lb.name}</option>
                  ))}
                </select>
                {errors.longBus && <div className="error-message">{errors.longBus}</div>}
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleEdit;
