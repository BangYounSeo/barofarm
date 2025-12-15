import axios from "axios";

const api = axios.create({
    baseURL: "/api", //setupProxy가 있으니 간단하게 사용
        
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config;
})

export default api;
