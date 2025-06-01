import React, { createContext, useState, useContext, useEffect } from 'react';
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
      } catch (error) {
          setIsAuthenticated(false);
          setUser(null);
      }
      setIsLoading(false);
  };

  checkAuth();
}, [isAuthenticated]);


useEffect(() => {
  // console.log("Updated user state:", user);
  // console.log("Updated isAuthenticated state:", isAuthenticated);
}, [user]);


  const register= async (name,email,password)=>{
    try{
      const res=await apiClient.post('/api/user-service/register',{name,email,password});
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

  const getOtp= async (email)=>{
    try{
      const res=await apiClient.post('/api/user-service/otp',{email});
      console.log("Verify Otp", res)
      return res
    }catch(err){
      console.error('OTP error:', err);
      throw err;
  }};

  const otpVerify= async (email,otp)=>{
    try{
      const res=await apiClient.post('/api/user-service/verifyotp',{email,otp});
      console.log("Verify Otp", res)
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
      const res = await apiClient.get('/admin/users');
      // console.log("Get all users", res.data.users)
      return res.data.users;
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
    <AuthContext.Provider value={{ user, isAuthenticated,getAdminAllUsers,adminUserUpdate, getAdminUsersById,isLoading, login,register, logout,getOtp,otpVerify }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);