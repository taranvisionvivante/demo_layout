import { useState } from "react";
import "./Index.css";
import { useDispatch } from "react-redux";
import { DataLoading } from "../../loader/Index";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { adminLogin } from "../../actions/adminActions";
import { greenhseBaseUrl } from "../config/config";
import toast from "react-hot-toast";

export default function Login() {
    const [formdata, setFormdata] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();

    const validateField = (name, value) => {
        let message = "";

        if (name === "email") {
            if (!value) message = "Email is required";
            else if (!/\S+@\S+\.\S+/.test(value))
                message = "Enter a valid email address";
        }

        if (name === "password" && !value) {
            message = "Password is required";
        }

        setErrors((prev) => ({ ...prev, [name]: message }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formdata.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formdata.email))
            newErrors.email = "Enter a valid email address";

        if (!formdata.password) newErrors.password = "Password is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormdata((prev) => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const apiUrl = greenhseBaseUrl + `index.php?type=login`;
            const response = await fetch(
                apiUrl,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formdata),
                }
            );
            const result = await response.json();
            if(result) {
                dispatch(adminLogin(result.data));
                localStorage.setItem("user", JSON.stringify(result.data));
                if(result.data){
                    toast.success("Login Successfully");
                }
            }
        } catch (err) {
            console.log("Fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-box" onSubmit={handleSubmit} autoComplete="off" noValidate>
                <h2>Login</h2>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formdata.email}
                    autoComplete="off"
                    onChange={handleChange}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}

                <div className="password-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={formdata.password}
                        autoComplete="new-password"
                        onChange={handleChange}
                    />
                    <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                    </span>
                </div>
                {errors.password && <p className="error-text">{errors.password}</p>}

                <button type="submit">Login</button>
            </form>

            {isLoading && <DataLoading />}
        </div>
    );
}