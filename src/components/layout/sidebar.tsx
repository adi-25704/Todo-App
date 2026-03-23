import "./sidebar.css"

export const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="nav-item active">home</div>
      <div className="nav-item">analytics</div>
      {/* <div className="nav-item">settings</div>
      <div className="nav-item" style={{ marginTop: '20px' }}>account_balance_wallet</div> */}
    </div>
  );
};