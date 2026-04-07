// import { Outlet } from "react-router-dom";
// import Sidebar from "../../sidebar/Index";

// const AdminLayout = () => {

//   return (
//     <div style={{  height: "100vh" }}>
      
//       {window.location.pathname === "/" &&
//         <div style={{ flexShrink: 0 }}>
//           <Sidebar />
//         </div>
//       }

//       <div style={{ flex: 1, overflowY: "auto" }}>
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;

import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../sidebar/Index";

const AdminLayout = () => {
  const location = useLocation();
  const showSidebar = location.pathname === "/";

  return (
    <div style={{ height: "100vh" }}>
      <style>
        {`
          .admin-content {
            height: 100vh;
            overflow-y: auto;
            transition: margin-left 0.3s ease;
          }

          .with-sidebar {
            margin-left: 220px;
          }

          @media (max-width: 768px) {
            .with-sidebar {
              margin-left: 0;
            }
          }
        `}
      </style>

      {showSidebar && <Sidebar />}

      <div className={`admin-content ${showSidebar ? "with-sidebar" : ""}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
