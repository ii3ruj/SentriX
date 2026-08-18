import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  
  // إذا لم يكن هناك توكن، ينقله لصفحة تسجيل الدخول 
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // إذا كان مسجلاً، اعرض الصفحة
  return <Outlet />;
};

export default ProtectedRoute;
