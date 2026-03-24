import "./header.css"

export const Header = ({ onAddClick }: { onAddClick: () => void }) => {
  return (
    <div className="header-bar">
      <h1 className="header-title">Dashboard Overview</h1>
      <button className="btn-primary" onClick={onAddClick}>+ Add New</button>
    </div>
  );
};