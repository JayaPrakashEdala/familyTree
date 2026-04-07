import React from "react";

const Login = () => {
  const handleGoogleLogin = () => {
    // TODO: connect to your backend / Google auth
    console.log("Google Sign-In clicked");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* App Name */}
        <h1 style={styles.title}>App Name</h1>

        {/* Google Sign In Button */}
        <button style={styles.googleButton}>
  <img
    src="https://developers.google.com/identity/images/g-logo.png"
    alt="google"
    style={{ width: "20px", marginRight: "10px" }}
  />
  Sign in with Google
</button>

      </div>
    </div>
  );
  
};
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  card: {
    width: "350px",
    padding: "40px",
    border: "2px solid #000",
    borderRadius: "10px",
    textAlign: "center",
    backgroundColor: "#fff",
  },
  title: {
    marginBottom: "40px",
    fontSize: "24px",
    fontWeight: "bold",
  },
  button: {
    padding: "12px 20px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #000",
    cursor: "pointer",
    backgroundColor: "#fff",
  },
  googleButton: {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px",
  width: "100%",
  borderRadius: "6px",
  border: "1px solid #ddd",
  cursor: "pointer",
  backgroundColor: "#fff",
}
};
export default Login;