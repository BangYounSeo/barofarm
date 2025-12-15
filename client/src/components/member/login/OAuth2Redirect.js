// OAuth2Redirect.jsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const OAuth2Redirect = () => {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {

    if(hasRun.current) return;
    hasRun.current = true;

    const href = window.location.href;

    const url = new URL(href);
    let token = url.searchParams.get("token")
    let userId = url.searchParams.get("userId")

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("userId",userId)
      navigate("/");
    } else {
      // 에러 처리
      navigate("/member/login");
    }
  }, [navigate]);

  return <div>소셜 로그인 처리 중...</div>;
};

export default OAuth2Redirect;
