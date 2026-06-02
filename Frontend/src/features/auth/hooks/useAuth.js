import { useContext, useEffect } from "react";
import { AuthContext } from "../auth.context.js";
import { login, register, logout, getMe, updateProfile } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext)
    const {user, setUser, loading, setLoading} = context

    const handleLogin = async ({email, password}) => {
        setLoading(true)
        try {
            const data = await login({email, password})
            if (data && data.user) {
                setUser(data.user)
                return true;
            } else {
                setUser(null)
                return false;
            }
        } catch (error) {
            console.error("Login error:", error)
            setUser(null)
            return false;
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async ({username, email, password}) => {
        setLoading(true)
        try {
            const data = await register({username, email, password})
            if (data && data.user) {
                setUser(data.user)
                return true;
            } else {
                setUser(null)
                return false;
            }
        } catch (error) {
            console.error("Register error:", error)
            setUser(null)
            return false;
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (error) {
            console.error("Logout error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async ({ username, email }) => {
        setLoading(true);
        try {
            const data = await updateProfile({ username, email });
            if (data && data.user) {
                setUser(data.user);
            }
            return data;
        } catch (error) {
            console.error("Update profile error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const getAndSetUser = async()=>{
            try{
                const data = await getMe()
                if (data && data.user) {
                    setUser(data.user)
                } else {
                    setUser(null)
                }
            }catch(err){
                console.log(err)
                setUser(null)
            }
            finally{
                setLoading(false)
            }
        }
        getAndSetUser()
    }, [setLoading, setUser])

    return {user, loading, handleRegister, handleLogin, handleLogout, handleUpdateProfile}
}