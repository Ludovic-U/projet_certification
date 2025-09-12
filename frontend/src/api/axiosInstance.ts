import axios from "axios";

const api_backend = axios.create({ //  TODO: move to a central api file
        baseURL: "http://localhost:4000/api/",
        withCredentials: true,
    });
export default api_backend;