import axios from "axios";

const getTokens = () => {
  const accessToken = localStorage.getItem("token");
  return {
    accessToken,
  };
};

// Create Instance For Api Call.
const instance = axios.create({
  baseURL: "http://54.145.65.218/api/v1",
  //  baseURL: "http://localhost:9000/api/v1",
});

instance.interceptors.response.use(
  (response) => {
    return response.data ? response.data : response;
  },
  (err) => {
    return new Promise(async (resolve, reject) => {
      reject(err.response && err.response.data ? err.response.data : err);
    });
  }
);

const getHeader = () => {
  const token = getTokens();
  if (token)
    return {
      headers: {
        Authorization: token?.accessToken,
      },
    };
};

const getRequest = (url) => {
  return instance.get(`${url}`, getHeader());
};

const deleteRequest = (url) => {
  return instance.delete(`${url}`, getHeader());
};

const postPostRequest = (url, body, method) => {
  if (method.toLowerCase() === "post")
    return instance.post(url, body, getHeader());
  if (method.toLowerCase() === "put")
    return instance.put(url, body, getHeader());
  if (method.toLowerCase() === "patch")
    return instance.patch(url, body, getHeader());
};

export const AxiosInstance = {
  getRequest: getRequest,
  postPostRequest: postPostRequest,
  deleteRequest: deleteRequest,
};
