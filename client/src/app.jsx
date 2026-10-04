import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Profile from "./pages/Profile.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Loader from "./components/Loader.jsx";
import Contacts from "./pages/Contacts.jsx";
import ContactRequests from "./pages/ContactRequests.jsx";
import ContactProfile from "./pages/ContactProfile.jsx";

function App() {
  const loader = useSelector((state) => state.loaderReducer.loader);

  return (
    <div>
      {loader && <Loader />}

      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route
              path="/contact-profile/:userId"
              element={<ContactProfile />}
            />
            <Route path="/requests" element={<ContactRequests />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/contacts/:userId" element={<Contacts />} />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
