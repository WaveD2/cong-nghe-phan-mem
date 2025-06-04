import { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../components/helper/axios';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    role: '',
    avatar: ''
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(false); 
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const checkAuth = async () => {
      try {
          const res = await apiClient.post('/api/user-service/verifyme', {}, {
            withCredentials: true,
          });
          console.log("Verify me::::", res)
          if(res.data.success){
            setUser(res.data.user);
            setIsAuthenticated(true);
          }
      } catch (error ) {
          setIsAuthenticated(false);
          setUser(null);
          console.log("Verify me error", error);
          
      }
      setIsLoading(false);
  };

  checkAuth();
}, []);


useEffect(() => {
  // console.log("Updated user state:", user);
  // console.log("Updated isAuthenticated state:", isAuthenticated);
}, [user]);


  const register= async (name,email,password, contact)=>{
    try{
      const res=await apiClient.post('/api/user-service/register',{name,email,password, phone: contact}, {
        withCredentials: true
      } );
      console.log("register::::", res.data);  
      if(res.data.success){
          console.log("Register", res)
          setUser(res.data);
          setIsAuthenticated(false);
      }
      // console.log(user)
      return res
    }catch(err){
      console.error('Register error:', err);
      throw err;
  }};

  const requestForgotPassword= async (email)=>{
    try{
      const res=await apiClient.post('/api/user-service/forgot-password/request',{email}, {
        withCredentials: true
      });
      console.log("Verify forgot-password", res)
      return res
    }catch(err){
      console.error('OTP error:', err);
      throw err;
  }};

  const confirmForgotPassword= async (email,otp)=>{
    try{
      const res=await apiClient.post('/api/user-service/forgot-password/confirm',{email, otp}, {
        withCredentials: true
      });
      console.log("Verify confirmForgotPassword", res)
      return res.data
    }catch(err){
      console.error('OTP error:', err);
      throw err;
  }};

  const forgotPassword= async (email,password)=>{
    try{
      const res=await apiClient.post('/api/user-service/forgot-password',{email, newPassword: password }, {
        withCredentials: true
      });
      console.log("Verify confirmForgotPassword", res)
      return res.data
    }catch(err){
      console.error('OTP error:', err);
      throw err;
  }};

  // Login function
  const login = async (email, password) => {
    try {
      const res = await apiClient.post(
        '/api/user-service/login',
        { email, password },
      
      );
      console.log("login::::", res.data);
      if(res.data.success){
        setUser(res.data);
        setIsAuthenticated(true);
      }
      return res;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/user-service/logout');
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };


  const getAdminAllUsers = async () => {
    try {
      const res = await apiClient.get('/api/user-service');
      // console.log("Get all users", res.data.users)
      return res.data;
    } catch (err) {
      console.error('Get all users error:', err);
      throw err;
    }
  };

  const getAdminUsersById = async (id) => {
    try {
      const res = await apiClient.get(`/admin/users/${id}`);
      console.log("Get user by id", res.data);
      return res.data;
    } catch (err) {
      console.error('Get user by id error:', err);
      throw err;
  }
  }

  const adminUserUpdate=async(id,user)=>{
    try{
        const res=await apiClient.put(`/admin/users/${id}`,user);
        console.log("Update user by id", res.data)
        return res.data
    }
    catch(err){
      console.error('Update user by id error:', err);
      throw err;
  }
  } 

  
  return (
    <AuthContext.Provider value={{ user,
     isAuthenticated,getAdminAllUsers,adminUserUpdate, getAdminUsersById,isLoading,
      login,register, logout,requestForgotPassword,confirmForgotPassword,forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);