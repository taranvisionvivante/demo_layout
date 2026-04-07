import { useState } from "react";
import "./Index.css";
import { useDispatch } from "react-redux";
import { adminLogin } from "../../actions/adminActions";
import { clearIndexedDB } from "../../IndexedDB";
import toast from "react-hot-toast";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPop, setIsPop] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = async() => {
    await clearIndexedDB();
    localStorage.clear();
    dispatch(adminLogin(null));
    toast.success("Logout Successfully");
  };

  return (
    <>
      <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "X" : "☰"}
        
      </button>

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <h3 className="sidebar-title">Admin Panel</h3>

        <ul className="menu">
          <li className="menu-item active">House Plans</li>
          <li className="menu-item logout-item" onClick={() => setIsPop(true)}>Logout</li>
        </ul>
      </aside>

      {isPop && (
        <div className="logout-overlay">
          <div className="logout-modal">
            <h4>Confirm Logout</h4>
            <p>Are you sure you want to logout?</p>
            <div className="logout-actions">
              <button className="btn cancel" onClick={() => setIsPop(false)}>
                Cancel
              </button>
              <button className="btn confirm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      
    </>
  );
}
