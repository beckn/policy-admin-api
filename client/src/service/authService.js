const { default: axios } = require("axios");
const https = require('https');
const agent = new https.Agent({  
  rejectUnauthorized: false
});
const doLogIn = async (account) => {
  try {
  const payload = {
    seller : {
      sellerEmail: account.email,
      sellerPassword: account.password,
    }
  };
  // }); //with credentials
  const user = await axios.post("/seller/login", payload , {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    httpsAgent: agent
  });
    localStorage.setItem("email", account.email);
    localStorage.setItem("isLoggedIn", true);
    return true;
} catch (error) {
  console.log(error);
  return false;
}
};

const isLoggedIn = () => {
  return Boolean(localStorage.getItem("isLoggedIn"));
};
const logOut = (props) =>{
  localStorage.removeItem("email");
  localStorage.removeItem("isLoggedIn");
  props.history.push("/login");
};

const signUp = async (account) => {
  try {
    const payload = {
      seller: {
        sellerName: account.firstName + " " + account.lastName,
        sellerEmail: account.email,
        sellerPhone: account.phone,
        sellerPassword: account.password,
      },
    };
    const user = await axios.post("/seller/register", payload, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      httpsAgent: agent
    });
    localStorage.setItem("email", account.email);
    localStorage.setItem("isLoggedIn", true);
    return user.data.token;
  }
  catch (error) {
    console.log(error);
    return false;
  }
};

const isEmailVerified = async (email) => {
  try {
    const user = await axios.get("/seller/check-email-verification", {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      httpsAgent: agent
    });
    return user.data;
  }
  catch (error) {
    console.log(error);
    return false;
  }
};

const resendEmail = async (email) => {
  try {
    await axios.post("/seller/send-verification-email", {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      httpsAgent: agent
    });
    return true;
  }
  catch (error) {
    console.log(error);
    return false;
  }
};

export default {
  doLogIn,
  isLoggedIn,
  logOut,
  signUp,
  isEmailVerified,
  resendEmail,
};

