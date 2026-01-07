const RecentVehicles = ({vehicles}) => {

    return (
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Plate Number</th>
              <th>Vehicle</th>
              <th>Driver Joined Date</th>
              <th>Vehicel Registered Date</th>
          
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>{vehicle.user.id}</td>
                <td>{vehicle.plate_number}</td>
                <td>
                  {vehicle.name} {vehicle.Model}
                </td>
                <td>{vehicle.user.date_joined}</td>
                <td>{new Date(vehicle.last_updated).toLocaleDateString()}</td>
               
              </tr>
            ))}
          </tbody>
        </table>
  
        <style  jsx={true}>{`
          .action-buttons {
            display: flex;
            gap: 5px;
          }
          
          .btn-sm {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
          }
        `}</style>
      </div>
    )
  }
  
  export default RecentVehicles
  
  