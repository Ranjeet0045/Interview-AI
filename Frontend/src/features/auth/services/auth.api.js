import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function register({username, email, password}){
    try{
        const response = await axios.post(`${API_URL}/api/auth/register`,{
            username, email, password
        },{
            withCredentials: true
        })
        return response.data;
    }
    catch(err){
        console.log(err);
    }
}


export async function login({ email, password }) {
    try {
        const response = await axios.post(`${API_URL}/api/auth/login`, {
            email,
            password
        }, {
            withCredentials: true
        });
        return response.data;
    } catch (err) {
        console.log('Login error:', err?.response?.data || err.message);
        // Return a consistent error object
        return { error: err?.response?.data?.message || 'Login failed' };
    }
}

export async function logout(){
    try{
        const response = await axios.get(`${API_URL}/api/auth/logout`,{
            withCredentials: true
        })
        return response.data
    }
    catch(err){
        console.log(err)
    }
}

export async function getMe(){
    try{
        const response = await axios.get(`${API_URL}/api/auth/get-me`,{
            withCredentials: true
        })
        return response.data
    }
    catch(err){
        console.log(err)
    }
}

export async function updateProfile({username, email}){
    const response = await axios.put(`${API_URL}/api/auth/update-profile`,{
        username, email
    },{
        withCredentials: true
    })
    return response.data;
}