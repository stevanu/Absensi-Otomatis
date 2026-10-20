import { Outlet } from 'react-router-dom';
import Sidebar from '../fragments/Sidebar.jsx';
import Toast from '../elements/Toast.jsx';

/** App shell: persistent sidebar + scrollable content + global toast layer. */
export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <Sidebar />
      <main className="flex-1 lg:ml-0">
        <Outlet />
      </main>
      <Toast />
    </div>
  );
}
