import "./header.css"

export const Header = ({ onAddClick }: { onAddClick: () => void }) => {
  return (
    <div className="header-bar">
      <h1 className="header-title">Dashboard Overview</h1>
      <button className="btn-primary" onClick={onAddClick}>+ Add New</button>
    </div>
  );
};

// export function Header()
// {
//     return (
//         <>
//         <section className="header-bar">
//             <h1>Subscription Tracker</h1>

//             <div className="monthly-summary" aria-label="Shows monthly summary">
//                 <table>
//                     <tr>
//                     <td>Monthly Expense</td>
//                     <td>Pending Tasks</td>
//                     <td>Clear</td>
//                     </tr>
//                     <tr>
//                         <td></td>
//                         <td></td>
//                         <td></td>
//                     </tr>                    
//                 </table>
//             </div>
//         </section>
        
        
//         </>
//     )
// }
