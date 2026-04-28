import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Landing        from './pages/Landing.jsx';
import Register       from './pages/Register.jsx';
import Login          from './pages/Login.jsx';
import ChildLogin     from './pages/ChildLogin.jsx';
import ParentDashboard from './pages/ParentDashboard.jsx';
import ChildDashboard  from './pages/ChildDashboard.jsx';
import LessonPage      from './pages/LessonPage.jsx';
import ProgressPage    from './pages/ProgressPage.jsx';
import PrivateRoute    from './components/PrivateRoute.jsx';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/"             element={<Landing />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/child-login"  element={<ChildLogin />} />

          <Route path="/parent/dashboard" element={
            <PrivateRoute allowedRoles={['parent']}><ParentDashboard /></PrivateRoute>
          } />
          <Route path="/parent/child/:childId/progress" element={
            <PrivateRoute allowedRoles={['parent']}><ProgressPage /></PrivateRoute>
          } />

          <Route path="/child/dashboard" element={
            <PrivateRoute allowedRoles={['child']}><ChildDashboard /></PrivateRoute>
          } />
          <Route path="/child/lesson/:lessonId" element={
            <PrivateRoute allowedRoles={['child']}><LessonPage /></PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;