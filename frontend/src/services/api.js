import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080/api"
});


// =====================================================
// AXIOS REQUEST INTERCEPTOR
// =====================================================

API.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem("token");


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        // IMPORTANT:
        //
        // DO NOT SET Content-Type HERE.
        //
        // For normal JSON request Axios handles it.
        //
        // For FormData request browser automatically
        // creates:
        //
        // multipart/form-data;
        // boundary=----------------...
        //

        return config;
    },

    (error) => {

        return Promise.reject(error);

    }
);


export default API;


// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'http://localhost:8080/api',
// });

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default API;
